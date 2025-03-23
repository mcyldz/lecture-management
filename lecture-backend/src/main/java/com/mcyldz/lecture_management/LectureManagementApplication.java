package com.mcyldz.lecture_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@ComponentScan(basePackages = {"com.mcyldz"})
@EntityScan(basePackages = {"com.mcyldz"})
@EnableJpaRepositories(basePackages = {"com.mcyldz"})
@SpringBootApplication
public class LectureManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(LectureManagementApplication.class, args);
	}

}
