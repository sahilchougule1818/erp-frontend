import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { LabMasterTab } from '../components/LabMasterTab';
import { PlantMasterTab } from '../components/PlantMasterTab';

export default function IndoorSettings() {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="lab-master" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="lab-master">
            Lab Master
          </TabsTrigger>
          <TabsTrigger value="plant-master">
            Plant Master
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lab-master" className="mt-6">
          <LabMasterTab />
        </TabsContent>

        <TabsContent value="plant-master" className="mt-6">
          <PlantMasterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
