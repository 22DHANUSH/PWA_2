import './assets/styles/global.css'

import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import React from 'react'
import { createRoot } from 'react-dom/client'
import theme from './assets/styles/theme'
import { store } from './app/store';
import { Provider } from 'react-redux';



createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
    <Provider store={store}>

      <BrowserRouter>
        <App />
      </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </React.StrictMode>
)