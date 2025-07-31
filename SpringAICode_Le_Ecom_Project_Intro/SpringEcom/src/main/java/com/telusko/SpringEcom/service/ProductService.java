package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(int id) {
        return productRepo.findById(id).orElse(new Product(-1));
    }

    public Product addOrUpdateProduct(Product product, MultipartFile image) throws IOException {

        product.setImageName(image.getOriginalFilename());
        product.setImageType(image.getContentType());
        product.setProductImage(image.getBytes());

        return productRepo.save(product);

    }


    public void deleteProduct(int id) {
        productRepo.deleteById(id);
    }

    @Transactional
    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }
}
