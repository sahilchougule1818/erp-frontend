import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { PHTunnelsTab } from '../components/PHTunnelsTab';
import { SHUnitsTab } from '../components/SHUnitsTab';

export default function OutdoorSettings() {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="ph-tunnels" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ph-tunnels">
            PH Tunnels
          </TabsTrigger>
          <TabsTrigger value="sh-units">
            SH Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ph-tunnels" className="mt-6">
          <PHTunnelsTab />
        </TabsContent>

        <TabsContent value="sh-units" className="mt-6">
          <SHUnitsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
