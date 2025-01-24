import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Building2, Calculator, X } from "lucide-react";
import debounce from "lodash/debounce";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Role {
  type: {
    kode: string;
    beskrivelse: string;
  };
  person?: {
    navn: {
      fornavn: string;
      mellomnavn?: string;
      etternavn: string;
    };
    fodselsdato?: string;
  };
  enhet?: {
    organisasjonsnummer: string;
    navn: string;
  };
  fratraadt: boolean;
}

interface RoleGroup {
  type: {
    kode: string;
    beskrivelse: string;
  };
  roller: Role[];
}

interface RolesResponse {
  rollegrupper: {
    type: {
      kode: string;
      beskrivelse: string;
    };
    roller: Role[];
  }[];
}

interface Company {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    adresse: string[];
    postnummer: string;
    poststed: string;
    kommune: string;
  };
  naeringskode1?: {
    beskrivelse: string;
    kode: string;
  };
  roles?: Role[];
}

interface AccountantClient {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    adresse: string[];
    postnummer: string;
    poststed: string;
  };
}

interface ReverseRoleResponse {
  rollegrupper: RoleGroup[];
}

interface RoleType {
  kode: string;
  beskrivelse: string;
}

interface EnhetRole {
  type: RoleType;
  status: string;
}

interface EnhetWithRoles {
  organisasjonsnummer: string;
  navn: string;
  roller: EnhetRole[];
}

interface RolleoversiktResponse {
  enheter: EnhetWithRoles[];
  _links: {
    self: {
      href: string;
    };
  };
}

interface BusinessAddress {
  adresse: string[];
  postnummer: string;
  poststed: string;
  kommune?: string;
  landkode?: string;
  land?: string;
}

interface CompanyDetails {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: BusinessAddress;
}

const CompanySearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyRoles, setCompanyRoles] = useState<Record<string, RolesResponse>>({});
  const [accountantClients, setAccountantClients] = useState<AccountantClient[]>([]);
  const [selectedAccountant, setSelectedAccountant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function to prevent too many API calls
  const searchCompanies = debounce(async (term: string) => {
    if (term.length < 2) {
      setCompanies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(term)}&size=10`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }

      const data = await response.json();
      const companiesWithRoles = await Promise.all(
        (data._embedded?.enheter || []).map(async (company: Company) => {
          try {
            const rolesResponse = await fetch(
              `https://data.brreg.no/enhetsregisteret/api/enheter/${company.organisasjonsnummer}/roller`,
              {
                headers: {
                  "Accept": "application/json",
                },
              }
            );
            
            if (rolesResponse.ok) {
              const rolesData = await rolesResponse.json();
              return {
                ...company,
                roles: rolesData.roller || [],
              };
            }
          } catch (error) {
            console.error("Error fetching roles:", error);
          }
          return company;
        })
      );

      setCompanies(companiesWithRoles);
    } catch (err) {
      setError("Could not fetch companies. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, 300);

  const fetchCompanyRoles = async (orgnr: string) => {
    try {
      console.log(`Fetching details for company ${orgnr}`);
      
      // Fetch company details
      const companyDetailsResponse = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (companyDetailsResponse.ok) {
        const companyDetails = await companyDetailsResponse.json();
        console.log('Company details:', companyDetails);
      }
      
      // Fetch roles (existing code)
      const rolesResponse = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}/roller`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!rolesResponse.ok) {
        console.log(`Roles response not OK for ${orgnr}:`, rolesResponse.status);
        return;
      }
      
      const rolesData = await rolesResponse.json();
      console.log('Roles data for company:', orgnr, rolesData);
      
      setCompanyRoles(prev => {
        const updated = { ...prev, [orgnr]: rolesData };
        return updated;
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAccountantClients = async (accountantOrgNr: string, accountantName: string) => {
    setIsLoading(true);
    try {
      console.log('=== Starting Client Search Process ===');
      console.log('Target Accountant:', { accountantOrgNr, accountantName });

      // Search for companies with this accountant's name in their roles
      const response = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter?size=100&regnskapsforer=${encodeURIComponent(accountantName)}`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const companies = data._embedded?.enheter || [];
      
      console.log(`Found ${companies.length} potential clients`);
      setAccountantClients(companies);

    } catch (error) {
      console.error('Error in search process:', error);
      setAccountantClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchCompanies(searchTerm);
    
    // Cleanup
    return () => {
      searchCompanies.cancel();
    };
  }, [searchTerm]);

  useEffect(() => {
    // Fetch roles for each company
    companies.forEach(company => {
      if (!companyRoles[company.organisasjonsnummer]) {
        fetchCompanyRoles(company.organisasjonsnummer);
      }
    });
  }, [companies]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Søk etter bedrifter
        </h1>

        <div className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Skriv inn bedriftsnavn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              Skriv minst 2 tegn for å søke
            </p>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {companies.map((company) => {
              if (companyRoles[company.organisasjonsnummer]) {
                console.log('Rendering roles for company:', 
                  company.organisasjonsnummer, 
                  companyRoles[company.organisasjonsnummer]
                );
              }

              return (
                <Card
                  key={company.organisasjonsnummer}
                  className="p-4 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                    
                    {company.naeringskode1?.kode === "69.201" && (
                      <div 
                        className="absolute top-4 right-4 w-8 h-8 bg-green-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-100"
                        title="Vis klientliste"
                        onClick={() => {
                          setSelectedAccountant(company.navn);
                          fetchAccountantClients(company.organisasjonsnummer, company.navn);
                        }}
                      >
                        <Calculator className="w-5 h-5 text-green-600" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {company.navn}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Org.nr: {company.organisasjonsnummer}
                      </p>
                      {company.forretningsadresse && (
                        <p className="text-sm text-gray-600 mt-1">
                          {company.forretningsadresse.adresse.join(", ")},{" "}
                          {company.forretningsadresse.postnummer}{" "}
                          {company.forretningsadresse.poststed}
                        </p>
                      )}
                      {company.naeringskode1 && (
                        <p className="text-sm text-gray-600 mt-1">
                          {company.naeringskode1.beskrivelse}
                        </p>
                      )}
                      {companyRoles[company.organisasjonsnummer]?.rollegrupper?.length > 0 && (
                        <div className="mt-2 border-t pt-2">
                          {companyRoles[company.organisasjonsnummer].rollegrupper
                            .filter(group => group.type.kode === "REGN" && group.type.beskrivelse === "Regnskapsfører")
                            .flatMap(group => 
                              group.roller
                                .filter(role => !role.fratraadt)
                                .map((role, roleIndex) => {
                                  const accountantName = role.person 
                                    ? `${role.person.navn.fornavn} ${role.person.navn.mellomnavn || ''} ${role.person.navn.etternavn}`.trim()
                                    : (role.enhet?.navn || '');
                                    
                                  const accountantOrg = role.enhet?.organisasjonsnummer;

                                  return accountantName ? (
                                    <p key={roleIndex} className="text-sm text-gray-600">
                                      Regnskapsfører: {accountantName}
                                      {accountantOrg && ` (Org.nr: ${accountantOrg})`}
                                    </p>
                                  ) : null;
                                })
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {searchTerm.length >= 2 && companies.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                Ingen bedrifter funnet
              </div>
            )}
          </div>
        </div>

        {/* Client list dialog */}
        <Dialog 
          open={selectedAccountant !== null} 
          onOpenChange={() => {
            setSelectedAccountant(null);
            setAccountantClients([]);
          }}
        >
          <DialogContent 
            className="max-w-2xl max-h-[80vh] overflow-y-auto"
            aria-describedby="client-list-description"
          >
            <DialogHeader>
              <DialogTitle>
                Klienter for {selectedAccountant}
              </DialogTitle>
              <p id="client-list-description" className="text-sm text-gray-500">
                Liste over alle bedrifter som bruker denne regnskapsføreren
              </p>
            </DialogHeader>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {accountantClients.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {isLoading ? 'Henter klienter...' : 'Ingen klienter funnet'}
                  </p>
                ) : (
                  accountantClients.map((client) => (
                    <div 
                      key={client.organisasjonsnummer}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <h3 className="font-medium">{client.navn}</h3>
                      <p className="text-sm text-gray-500">
                        Org.nr: {client.organisasjonsnummer}
                      </p>
                      {client.forretningsadresse && (
                        <p className="text-sm text-gray-600 mt-1">
                          {client.forretningsadresse.adresse.join(", ")},{" "}
                          {client.forretningsadresse.postnummer}{" "}
                          {client.forretningsadresse.poststed}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompanySearch; 