package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.socialMediaForum.repositories")
@EntityScan(basePackages = "com.example.socialMediaForum.model")
@ComponentScan(basePackages = "com.example.socialMediaForum")
public class SocialMediaForumApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialMediaForumApplication.class, args);
    }
}
