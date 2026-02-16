param location string = resourceGroup().location
param acrName string
param acrPoolSubnetId string = ''

resource acr 'Microsoft.ContainerRegistry/registries@2025-11-01' existing =  {
  name: acrName
}

resource acrPool 'Microsoft.ContainerRegistry/registries/agentPools@2025-03-01-preview' = {
  name: 'private-pool'
  location: location
  parent: acr
  properties: {
    count: 1
    os: 'Linux'
    tier: 'S1'
    virtualNetworkSubnetResourceId: acrPoolSubnetId
  }
}
