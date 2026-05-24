import React, { useRef } from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import SubscribeNews from '../Components/SubscibeNews/SubscribeNews'

const Shop = () => {
  const newCollectionsRef = useRef(null);

  const handleScrollToNewCollections = () => {
    newCollectionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div>
      <Hero onScrollToNew ={handleScrollToNewCollections} />
      <Popular />
      <Offers />
      <NewCollections ref={newCollectionsRef} />
      <SubscribeNews />
    </div>
  )
}

export default Shop;