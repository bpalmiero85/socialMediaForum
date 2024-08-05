package com.example.socialMediaForum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.example.socialMediaForum")
@EnableJpaRepositories(basePackages = "com.example.socialMediaForum.repositories")
public class SocialMediaForumApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialMediaForumApplication.class, args);
    }
}
