package com.example.chat.domain.initdata;

import com.example.chat.domain.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("dev")
public class Dev {
    @Autowired
    PasswordEncoder passwordEncoder;

    //    @Bean
//    public ApplicationRunner init(MemberService memberService) {
//        return args -> {
//            // Read profile image file and convert to MultipartFile
//            File file = new File("C:\\Users\\SBS\\Desktop\\밥먹냐.jpeg");
//            try (FileInputStream input = new FileInputStream(file)) {
//                MockMultipartFile multipartFile = new MockMultipartFile("file", file.getName(), "image/jpeg", input);
//
//                // Call the signup method
//                memberService.signup("user1", "01012345678", "user1", "1234", "admin@test.com",
//                        26, "남자", "대전", "일식", multipartFile);
//
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//
//            File file1 = new File("C:\\Users\\SBS\\Desktop\\개구리.jpg");
//            try (FileInputStream input = new FileInputStream(file1)) {
//                MockMultipartFile multipartFile1 = new MockMultipartFile("file1", file1.getName(), "image/jpeg", input);
//
//                // Call the signup method
//
//                memberService.signup("user2", "01012345678", "user2", "1234", "admin@test.com",
//                        25, "여자", "대전", "일식", multipartFile1);
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        };
//    }
    @Bean
    public ApplicationRunner init(MemberService memberService) {
        return args -> {

            // 회원가입 메서드 호출
            memberService.signup("user1", "01012345678", "user1", "1234", "admin@test.com",
                    26, "남자", "대전", "일식");
            memberService.signup("user2", "01012345678", "user2", "1234", "admin@test.com",
                    25, "여자", "대전", "일식");

        };
    }
}
