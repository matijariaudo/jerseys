
//localStorage.removeItem("cart");


cart=JSON.parse(localStorage.getItem("cart"));
console.log(cart)
setTimeout(() => {
    searchProducts()  
}, 100);
//

function addProductCard(code,qty,size,id){
    console.log(code,qty,size,id)
    if(!cart){cart=[];}
    cart.push({code,qty,size,id});
    console.log(cart)
    localStorage.setItem("cart",JSON.stringify(cart));
    searchProducts()
}

function deleteProductCard(pos){
    cart.splice(pos,1)
    localStorage.setItem("cart",JSON.stringify(cart));
    searchProducts()
}

function deleteCart(){
    localStorage.removeItem("cart");
    localStorage.removeItem("cartCode");
    localStorage.removeItem("cupon");
    searchProducts()
}


function searchProducts(){
    cart=JSON.parse(localStorage.getItem("cart"));
    console.log(cart)
    productCodes=cart.map(a=>a.code);
    console.log(productCodes,cart)
    try {
        ajax("/api/products/bycodes",{productCodes,img:true},(e)=>{
            const {products}=e.data;
            console.log(products)
            const {images}=e.data;
            totalQty=0;totalPrice=0;
            $(".shopping-list").html("");
            cart.forEach((e,i) => {
                const qty=e.qty;
                const product=products.find(a=>a.code===e.code);
                if(!product){cart.splice(i,1);console.log("No encontrado");return false;}
                totalQty+=parseInt(qty);totalPrice+=qty*parseFloat(product.price);
                $(".shopping-list").append(`
                    <li>
                        <a href="javascript:void(0)" class="remove" title="Remove this item"><i
                                class="lni lni-close"></i></a>
                        <div class="cart-img-head">
                            <a class="cart-img" href="product-details.html"><img
                                    src="https://margen.site/jerseys/test.php?img=${product.mainImg}" alt="#"></a>
                        </div>
                        <div class="content">
                            <h4><a href="product-details.html">${product.product}</a></h4>
                            <p class="quantity">${e.qty} x <span class="amount">${product.price}</span> (${e.size})</p>
                        </div>
                    </li>`);
            });
            $(".shopping-qty").html(totalQty);
            $(".shopping-total-amount").html(totalPrice.toFixed(2));
        })    
    } catch (error) {
        
    }
    
}