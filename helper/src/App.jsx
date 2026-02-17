import React from 'react';
import { ConfigContext } from './index.jsx'
import PortalNav from './components/portalnav.jsx'

export default function App() {

  return (
    <ConfigContext.Consumer>
      {config => <PortalNav config={config} />}
    </ConfigContext.Consumer>
  )
}

