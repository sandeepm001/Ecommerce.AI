import React, { useState } from 'react'
import './addProduct.css';
import upload_img from '../../assets/Admin_Assets/upload_area.svg'

const addProduct = () => {

    const [image, setImage] = useState(false);

    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "Men",
        new_price: "",
        old_price: ""
    });
    const imageHandler = (e) => {
        setImage(e.target.files[0])
    }

    const handleChange = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value })
    }
    const handleAddProduct = async () => {
        console.log("Initial product details", productDetails);
        let responseData;
        let product = productDetails;

        let formData = new FormData();
        formData.append('product', image);

        await fetch('http://localhost:4000/upload', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: formData,
        }).then((resp) => resp.json()).then((data) => { responseData = data })
        if (responseData.success) {
            product.image = responseData.image_url;
            console.log(product);
            await fetch('http://localhost:4000/addProduct', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    "Content-Type":'application/json'                    
            },
            body:JSON.stringify(product),
        }).then((resp)=>resp.json()).then((data) => {
            data.success? alert("Product added"):alert("Prduct failed to add")
        })
    }else {
        console.log("not added properlyy")
}
    }

return (
    <div className='addproduct'>
        <div className="addproduct-item">
            <p>Product Title</p>
            <input value={productDetails.name} onChange={handleChange} type="text" name="name" placeholder='product title' />
        </div>
        <div className="addproduct-price">
            <div className="addproduct-item">
                <p>price</p>
                <input value={productDetails.old_price} onChange={handleChange} type="number" name="old_price" placeholder='enter Original price' />
            </div>
            <div className="addproduct-item">
                <p>Offer price</p>
                <input value={productDetails.new_price} onChange={handleChange} type="number" name="new_price" placeholder='enter Offer price' />
            </div>
        </div>
        <div className="addproduct-item">
            <p>Product Categroy</p>
            <select value={productDetails.category} onChange={handleChange} name="category" className='addproduct-selector'>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kid">Kid</option>
            </select>
        </div>
        <div className="addproduct-item">
            <label htmlFor="file-input">
                <img src={image ? URL.createObjectURL(image) : upload_img} alt="upload-image" className='addproduct-upload-img' />
            </label>
            <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
        </div>
        <button onClick={handleAddProduct} className="addproduct-btn">
            ADD
        </button>
    </div>
)
}

export default addProduct