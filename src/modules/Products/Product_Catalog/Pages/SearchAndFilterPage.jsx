import React from 'react'
import { ProductProvider } from '../../ProductContext'
import SearchAndFilterDemo from '../Components/SearchAndFilterDemo'

const SearchAndFilterPage = () => {
  return (
    <>
    <ProductProvider>
      <SearchAndFilterDemo />
    </ProductProvider>
    </>
  )
}

export default SearchAndFilterPage
