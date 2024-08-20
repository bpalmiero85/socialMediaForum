package com.example.socialMediaForum.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/Users/brianpalmiero/Desktop/socialMediaForum/static/uploads");
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedHeader("*");
        config.addAllowedMethod(HttpMethod.GET);
        config.addAllowedMethod(HttpMethod.POST);
        config.addAllowedMethod(HttpMethod.DELETE);
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Configuration
    public class FileUploadConfig {
        @Bean
        public CommonsMultipartResolver multipartResolver() {
            CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
            multipartResolver.setMaxUploadSize(10485760); 
            return multipartResolver;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .cors().and()
                    .csrf().disable()
                    .authorizeRequests()
                    .antMatchers(HttpMethod.POST, "/user/**").permitAll()
                    .antMatchers(HttpMethod.GET, "/user/**").permitAll()
                    .antMatchers(HttpMethod.DELETE, "/user/**").permitAll()
                    .antMatchers(HttpMethod.GET, "/threads/**").permitAll()
                    .antMatchers(HttpMethod.POST, "/threads/**").permitAll()
                    .antMatchers(HttpMethod.PUT, "/threads/**").permitAll()
                    .antMatchers(HttpMethod.DELETE, "/threads/**").permitAll()
                    .antMatchers(HttpMethod.GET, "/posts/**").permitAll()
                    .antMatchers(HttpMethod.POST, "/posts/**").permitAll()
                    .antMatchers(HttpMethod.PUT, "/posts/**").permitAll()
                    .antMatchers(HttpMethod.DELETE, "/posts/**").permitAll()
                    .antMatchers("/h2-console/**").permitAll()
                    .antMatchers("/uploads/**").permitAll()

                    .anyRequest().authenticated()
                    .and()
                    .formLogin()
                    .and()
                    .headers().frameOptions().sameOrigin();

            return http.build();
        }
    }
}
}