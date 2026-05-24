import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useParams } from 'react-router-dom';
import ProductPath from '../Components/ProductPath/ProductPath';
import './styles/Product.css';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import ProductDescriptionReviews from '../Components/ProductDescriptionReviews/ProductDescriptionReviews';
import ProductRelated from '../Components/ProductRelated/ProductRelated';

const Product = () => {
	const { all_product } = useContext(ShopContext);
	const { productId } = useParams();
	const product = all_product.find((e) => e.id === Number(productId));

	if (!product) {
		return <p>Product not found!</p>;
	}

	return (
		<div>
			<ProductPath product={product} />
      		<ProductDisplay product={product} />
			<ProductDescriptionReviews/>
			<ProductRelated />
		</div>
	);
};

export default Product;
