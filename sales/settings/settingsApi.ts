import apiClient from '../../shared/services/apiClient';

export const settingsApi = {
  // Company Settings
  getCompanySettings: () => apiClient.get('/sales/settings/company'),
  updateCompanySettings: (data: any) => apiClient.put('/sales/settings/company', data),

  // Plant Terms
  getAllPlantTerms: () => apiClient.get('/sales/settings/plant-terms'),
  getPlantTerms: (plantName: string) => apiClient.get(`/sales/settings/plant-terms/${plantName}`),
  upsertPlantTerms: (plantName: string, terms: string[]) => 
    apiClient.put(`/sales/settings/plant-terms/${plantName}`, { terms }),
  deletePlantTerms: (plantName: string) => apiClient.delete(`/sales/settings/plant-terms/${plantName}`),
};
