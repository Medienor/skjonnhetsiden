import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/utils/supabase';

const API_KEY = "8f18826e-2d3b-4e15-bf2b-6162057966a7";

interface ArticleResponse {
  articleId?: string;
  status?: string;
  statusDetail?: string;
  progress?: number;
  output?: {
    html?: string;
  };
}

const Tool = () => {
  const [userInput, setUserInput] = useState("");
  const [gptVersion, setGptVersion] = useState("claude-3.5-sonnet");
  const [articleId, setArticleId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to extract image URL from HTML content
  const extractImageUrl = (html: string): string | null => {
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
  };

  const createArticle = async () => {
    console.log('Starting new article generation:', userInput);
    
    const webhookUrl = `${window.location.origin}/api/koala-webhook`;
    console.log('Using webhook URL:', webhookUrl);
    
    setIsLoading(true);
    try {
      const response = await fetch("https://koala.sh/api/articles/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetKeyword: userInput,
          gptVersion: "claude-3.5-sonnet",
          autoPolish: true,
          disableIntroduction: true,
          disableConclusion: true,
          multimediaOption: "images",
          imageStyle: "photo",
          imageModel: "premium",
          maxImages: 1,
          articleLength: "shorter",
          realTimeData: true,
          shouldCiteSources: false,
          includeKeyTakeaways: false,
          imageSize: "1024x1024",
          language: "Norwegian",
          extraSectionPrompt: "Skriv titler med kun 1 stor forbokstav f.eks \"Slik er skatteåret 2025\" ikke \"Slik Er Skatteåret 2025\"",
          webhookUrl: webhookUrl
        }),
      });

      const data: ArticleResponse = await response.json();
      console.log('Article creation response:', data);
      if (data.articleId) {
        setArticleId(data.articleId);
        checkStatus(data.articleId);
      }
    } catch (error) {
      console.error("Error creating article:", error);
      setContent("Error: Could not create article");
      setIsLoading(false);
    }
  };

  const checkStatus = async (articleId: string) => {
    try {
      const response = await fetch(`https://koala.sh/api/articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(`Status check for ${articleId}:`, data);

      if (data.status === 'finished' && data.output?.html) {
        console.log('Article finished, saving to Supabase...');
        try {
          const slug = data.config.targetKeyword
            .toLowerCase()
            .replace(/æ/g, 'ae')
            .replace(/ø/g, 'o')
            .replace(/å/g, 'a')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Extract image URL from HTML content
          const imageUrl = extractImageUrl(data.output.html);
          console.log('Extracted image URL:', imageUrl);

          const { data: supabaseData, error } = await supabase
            .from('guides')
            .insert([
              {
                title: data.config.targetKeyword,
                content: data.output.html,
                slug: slug,
                created_at: new Date().toISOString(),
                image_url: imageUrl
              }
            ])
            .select()
            .single();

          if (error) {
            console.error('Supabase error:', error);
          } else {
            console.log('Guide saved to Supabase:', supabaseData);
          }
        } catch (error) {
          console.error('Error saving to Supabase:', error);
        }
      }

      setStatus(data.status);
      setContent(data.output?.html || null);
      setIsLoading(false);

      if (data.status === 'processing' || data.status === 'queued') {
        setTimeout(() => checkStatus(articleId), 10000);
      }
    } catch (error) {
      console.error(`Error checking status for ${articleId}:`, error);
      setStatus('failed');
      setContent('Error: Failed to check status');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Koala Writer Tool | Regnskapsførerlisten.no</title>
        <meta name="description" content="Generate articles using Koala Writer API" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-8">Koala Writer</h1>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Keyword
                  </label>
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter your target keyword..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPT Version
                  </label>
                  <Select value={gptVersion} onValueChange={setGptVersion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4 Mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4</SelectItem>
                      <SelectItem value="claude-3.5-sonnet">Claude 3.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={createArticle} 
                  disabled={isLoading || !userInput.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {status === "processing" ? "Writing article..." : "Starting..."}
                    </>
                  ) : (
                    "Generate Article"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(content || isLoading) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Generated Content:</h2>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-3 text-gray-600">
                        {status === "processing" ? "Writing article..." : "Starting..."}
                      </span>
                    </div>
                  ) : (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: content || "" }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Tool; 