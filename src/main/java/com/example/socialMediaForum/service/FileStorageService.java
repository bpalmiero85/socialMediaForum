package com.example.socialMediaForum.service;

import java.io.File;
import javax.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class FileStorageService {
  private final String uploadDir = "uploads/";

  @PostConstruct
  public void init() {
    File uploadDirFile = new File(uploadDir);
    if (!uploadDirFile.exists()) {
      uploadDirFile.mkdirs();
    }
  }

  public String getUploadDir() {
    return uploadDir;
  }
}
