import { SalesSettingsTable } from './components/SalesSettingsTable';
import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Plus } from 'lucide-react';
import { SharedForm } from '../components/SharedForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { useCompanySettings, usePlantTerms } from '../hooks/useSettings';
import { PlantTermsDialog } from './PlantTermsDialog';

const SettingsContainer: React.FC = () => {
  const { settings, updateSettings } = useCompanySettings();
  const { plantTerms, upsertPlantTerms, deletePlantTerms } = usePlantTerms();

  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [isPlantFormOpen, setIsPlantFormOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);

  const handleCompanySubmit = async (data: any) => {
    try {
      await updateSettings(data);
      setIsCompanyFormOpen(false);
    } catch (error) {
      console.error('Company submit error:', error);
    }
  };

  const handlePlantSubmit = async (data: { plantName: string; terms: string[] }) => {
    try {
      await upsertPlantTerms(data.plantName, data.terms);
      setIsPlantFormOpen(false);
      setSelectedPlant(null);
    } catch (error) {
      console.error('Plant submit error:', error);
    }
  };

  const handlePlantDelete = async (plantName: string) => {
    try {
      if (!window.confirm(`Delete all terms for "${plantName}"?`)) return;
      await deletePlantTerms(plantName);
      setIsPlantFormOpen(false);
      setSelectedPlant(null);
    } catch (error) {
      console.error('Plant delete error:', error);
    }
  };

  const plantColumns = [
    { key: 'plantName', label: 'Plant Name' },
    {
      key: 'terms',
      label: 'Terms Count',
      render: (_: any, record: any) => {
        const terms = Array.isArray(record.terms) ? record.terms : JSON.parse(record.terms || '[]');
        return `${terms.length} terms`;
      }
    },
    {
      key: 'preview',
      label: 'Preview',
      render: (_: any, record: any) => {
        const terms = Array.isArray(record.terms) ? record.terms : JSON.parse(record.terms || '[]');
        const preview = terms.slice(0, 2).join(', ');
        return <span className="text-base text-gray-600">{preview}{terms.length > 2 ? '...' : ''}</span>;
      }
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="company">Company Details</TabsTrigger>
          <TabsTrigger value="plant-terms">Plant Terms</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <SalesSettingsTable
            title="Company Settings"
            columns={[
              { key: 'companyName', label: 'Company Name' },
              { key: 'gstNumber', label: 'GST Number' },
              { key: 'email', label: 'Email' },
              { key: 'contactNumber', label: 'Contact' },
              { key: 'village', label: 'Village' },
              { key: 'district', label: 'District' }
            ]}
            records={settings ? [settings] : []}
            onEdit={() => setIsCompanyFormOpen(true)}
            addButton={
              !settings ? (
                <Button
                 
                  onClick={() => setIsCompanyFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Company Details
                </Button>
              ) : undefined
            }
            exportFileName="company_settings"
          />
        </TabsContent>

        <TabsContent value="plant-terms">
          <SalesSettingsTable
            title="Plant Terms"
            columns={plantColumns}
            records={plantTerms}
            onEdit={(record) => {
              const terms = Array.isArray(record.terms) ? record.terms : JSON.parse(record.terms || '[]');
              setSelectedPlant({ ...record, terms: terms.join('\n') });
              setIsPlantFormOpen(true);
            }}
            addButton={
              <Button
               
                onClick={() => {
                  setSelectedPlant(null);
                  setIsPlantFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Plant Terms
              </Button>
            }
            filterConfig={{
              filter1Key: 'plantName',
              filter1Label: 'Plant Name',
              filter2Key: 'plantName',
              filter2Label: 'Search'
            }}
            exportFileName="plant_terms"
          />
        </TabsContent>
      </Tabs>

      {/* Company Settings Form */}
      <SharedForm
        open={isCompanyFormOpen}
        title={settings ? 'Edit Company Details' : 'Add Company Details'}
        onClose={() => setIsCompanyFormOpen(false)}
        fields={[
          { name: 'companyName', label: 'Company Name', type: 'text', required: true, gridColumn: 'col-span-2' },
          { name: 'gstNumber', label: 'GST Number', type: 'text' },
          { name: 'dbtNumber', label: 'DBT Number', type: 'text' },
          { name: 'village', label: 'Village / Area', type: 'text', gridColumn: 'col-span-2' },
          { name: 'tal', label: 'Tal (Taluka)', type: 'text' },
          { name: 'district', label: 'District', type: 'text' },
          { name: 'pincode', label: 'Pincode', type: 'text' },
          { name: 'email', label: 'Email Address', type: 'email' },
          { name: 'contactNumber', label: 'Contact Number', type: 'text' }
        ]}
        defaultValues={settings}
        onSubmit={handleCompanySubmit}
        submitLabel={settings ? 'Update' : 'Save'}
      />

      {/* Plant Terms Dialog */}
      <PlantTermsDialog
        open={isPlantFormOpen}
        onClose={() => {
          setIsPlantFormOpen(false);
          setSelectedPlant(null);
        }}
        onSubmit={handlePlantSubmit}
        onDelete={selectedPlant ? handlePlantDelete : undefined}
        defaultValues={selectedPlant}
      />
    </div>
  );
};

export default SettingsContainer;
export { SettingsContainer };
