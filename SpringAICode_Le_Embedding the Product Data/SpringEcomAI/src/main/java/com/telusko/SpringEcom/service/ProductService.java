package com.telusko.SpringEcom.service;

import com.telusko.SpringEcom.model.Product;
import com.telusko.SpringEcom.repo.ProductRepo;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private VectorStore vectorStore;

    @Autowired
    private AiImageGeneratorService aiImageGenService;

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(int id) {
        return productRepo.findById(id).orElse(new Product(-1));
    }

    public Product addOrUpdateProduct(Product product, MultipartFile image) throws IOException {

        if(image != null && !image.isEmpty()) {
            product.setImageName(image.getOriginalFilename());
            product.setImageType(image.getContentType());
            product.setImageData(image.getBytes());
        }

        Product savedProduct = productRepo.save(product);

        String content = String.format("""
                
                Product Name: %s
                Description: %s
                Brand: %s
                Category: %s
                Price: %.2f
                Release Date: %s
                Available: %s
                Stock: %s
                """,
                savedProduct.getName(),
                savedProduct.getDescription(),
                savedProduct.getBrand(),
                savedProduct.getCategory(),
                savedProduct.getPrice(),
                savedProduct.getReleaseDate(),
                savedProduct.isProductAvailable(),
                savedProduct.getStockQuantity()
        );

        Document document = new Document(
                UUID.randomUUID().toString(),
                content,
                Map.of("productId", String.valueOf(savedProduct.getId()))
        );

        vectorStore.add(List.of(document));

        return savedProduct;

    }


    public void deleteProduct(int id) {
        productRepo.deleteById(id);
    }

    @Transactional
    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }

    public String generateDescription(String name, String category) {

        String descPrompt = String.format("""
                
                Write a concise and professional product description for an e-commerce listing.
                
                Product Name: %s
                Category: %s
                
                Keep it simple, engaging, and highlight its primary features or benefits.
                Avoid technical jargon and keep it customer-friendly.
                Limit the description to 250 characters maximum.
                
                """, name , category );

        String desc = chatClient.prompt(descPrompt)
                .call()
                .chatResponse()
                .getResult()
                .getOutput()
                .getText();

        return desc;
    }

    public byte[] generateImage(String name, String category, String description) {

        String imagePrompt = String.format("""
                Generate a highly realistic, professional-grade e-commerce product image.
                
                     Product Details:
                     - Category: %s
                     - Name: '%s'
                     - Description: %s
                
                     Requirements:
                     - Use a clean, minimalistic, white or very light grey background.
                     - Ensure the product is well-lit with soft, natural-looking lighting.
                     - Add realistic shadows and soft reflections to ground the product naturally.
                     - No humans, brand logos, watermarks, or text overlays should be visible.
                     - Showcase the product from its most flattering angle that highlights key features.
                     - Ensure the product occupies a prominent position in the frame, centered or slightly off-centered.
                     - Maintain a high resolution and sharpness, ensuring all textures, colors, and details are clear.
                     - Follow the typical visual style of top e-commerce websites like Amazon, Flipkart, or Shopify.
                     - Make the product appear life-like and professionally photographed in a studio setup.
                     - The final image should look immediately ready for use on an e-commerce website without further editing.
                     """, category, name, description);

        byte[] aiImage = aiImageGenService.generateImage(imagePrompt);

        return aiImage;
    }
}
