-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: university_blog_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(2000) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `post_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKh4c7lvsc298whoyd4w9ta25cr` (`post_id`),
  KEY `FK8omq0tc18jd43bu5tjh6jvraq` (`user_id`),
  CONSTRAINT `FK8omq0tc18jd43bu5tjh6jvraq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKh4c7lvsc298whoyd4w9ta25cr` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (2,'wow very helpful','2026-11-12 09:41:25.386437',7,5);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_otps`
--

DROP TABLE IF EXISTS `email_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_otps` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempts` int NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `last_sent_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKdvueni1bidt6q3scq0joa9t1n` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_otps`
--

LOCK TABLES `email_otps` WRITE;
/*!40000 ALTER TABLE `email_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_registrations`
--

DROP TABLE IF EXISTS `pending_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pending_registrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempts` int NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `last_sent_at` datetime(6) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK7ff8wqb85sc2cy9rkxmebhrfv` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_registrations`
--

LOCK TABLES `pending_registrations` WRITE;
/*!40000 ALTER TABLE `pending_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `pending_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `post_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `FKm6cfovkyqvu5rlm6ahdx3eavj` (`tag_id`),
  CONSTRAINT `FKkifam22p4s1nm3bkmp1igcn5w` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `FKm6cfovkyqvu5rlm6ahdx3eavj` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ai_summary` text,
  `content` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `author_id` bigint NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'APPROVED',
  `reject_reason` varchar(500) DEFAULT NULL,
  `image_alt` varchar(300) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6xvn0811tkyo3nfjk2xvqx6ns` (`author_id`),
  CONSTRAINT `FK6xvn0811tkyo3nfjk2xvqx6ns` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'- Modern full-stack web development is shifting from simple CRUD operations to intelligent systems using Java Spring Boot 3.\n- Backend engineers can connect web apps to Generative AI models using modern HTTP clients like RestClient.\n- This setup enables real-time content analysis, intelligent tagging, and instant summaries for user blog posts.\n- Combining MySQL with AI-driven APIs provides both application reliability and modern smart capabilities.','Modern full-stack web development is moving beyond simple CRUD operations toward intelligent systems. By leveraging Java Spring Boot 3 and modern HTTP clients like RestClient, backend engineers can seamlessly connect web applications to state-of-the-art Generative AI models. This setup enables real-time content analysis, intelligent tagging, and instant summaries for user-generated blog posts. Combining a robust relational database like MySQL with AI-driven APIs offers both reliability and modern smart capabilities for enterprise-grade applications.','2026-11-05 04:39:57.901371','Building Context-Aware Web Applications with Spring Boot and Gemini API','2026-11-07 06:28:51.574437',1,'APPROVED',NULL,NULL,NULL),(2,'- Khoa Công nghệ Thông tin mở đăng ký cuộc thi Hackathon 2026 với chủ đề ứng dụng AI trong đời sống sinh viên.\n- Các đội thi có 48 giờ để xây dựng sản phẩm hoàn chỉnh từ ý tưởng ban đầu.\n- Tổng giá trị giải thưởng lên đến 50 triệu đồng kèm cơ hội thực tập tại các tập đoàn công nghệ lớn.\n- Hạn chót đăng ký tham gia là ngày 15/11/2026.','Khoa Công nghệ Thông tin chính thức mở đăng ký cuộc thi Hackathon 2026 với chủ đề \'Ứng dụng AI trong Đời sống Sinh viên\'. Cuộc thi dành cho tất cả sinh viên đam mê lập trình và phát triển sản phẩm. Các đội tham gia sẽ có 48 giờ để xây dựng một sản phẩm hoàn chỉnh từ ý tưởng ban đầu. Tổng giá trị giải thưởng lên đến 50 triệu đồng cùng cơ hội thực tập tại các tập đoàn công nghệ hàng đầu. Hạn chót đăng ký là ngày 15/11/2026.','2026-11-05 04:40:33.742428','Thông báo Cuộc thi Hackathon Sinh viên 2026','2026-11-07 14:31:01.758103',2,'APPROVED',NULL,NULL,NULL),(3,NULL,'On Sunday 8 November 2026, homes across the world will light up for Diwali. In India, a land of diverse cultures and rich regional heritage, the way people mark this festival of lights varies noticeably from state to state. Beyond any single story or regional narrative, Diwali brings everyone together. It is a shared season when families clean their homes, streets light up warm and golden, special recipes are made, and communities gather to share joy and laughter. \n\nExploring how different parts of the country observe Diwali reveals the amazing variety of food, art and customs that define everyday life in India. \n\nCandles and flowers laid out in a design on the floor\nIn the northern states, including Uttar Pradesh, Delhi, Punjab, Haryana, and Rajasthan, Diwali is celebrated on a grand visual scale. Preparations begin several weeks early as families paint their houses, clear out old clutter and hang bright flower garlands made of marigolds over their main doorways. As the sun sets, balconies and window ledges are lined with rows of small clay lamps (divas) filled with oil or ghee.  \n\nToday, these traditional divas are paired with long strings of colourful electric lights, making whole streets shine bright at night. The floor art called rangoli is drawn at the main entrance using coloured powders and flower petals to welcome guests. The kitchens stay busy all day preparing crisp savouries along with traditional sweets like kaju katli and gulab jamun. In farming areas, the festival also marks the end of the main autumn harvest season, giving farming families a reason to celebrate a good crop and share fresh sweets with their neighbours. \n\nMoving towards the west, Maharashtra and Gujarat, the festival blends local history with daily life. In Maharashtra, festivities start with a day dedicated to caring for farm animals, showing deep respect for nature and agriculture. On the main morning of the festival, people wake up before sunrise for a traditional bath using herbal pastes made from sandalwood and flowers. Afterwards, families sit together to eat a special festive platter called faral, packed with crisp snacks like chakli and sweet pastries like karanji.  \n\nIn Gujarat, Diwali brings the closing of the traditional year. The very next day is celebrated as the New Year, so local business owners close their old record books and open fresh ledgers. People wear new clothes, decorate their front doors with beaded hanging ornaments, and visit elders and neighbours to wish them good health and success for the coming year. \n\nIn the southern states of Tamil Nadu, Karnataka, Andhra Pradesh, Telangana, and Kerala, the festival is widely called Deepavali. Celebrations here begin much earlier in the day compared to the north. Instead of waiting for the evening, families wake up while it is still dark, around four in the morning. Those celebrating take a warm sesame oil massage followed by a bath using natural herbal powders. This early bath is considered a fresh, healthy start to the new season. After dressing in new clothes, family members drink a small spoonful of homemade herbal medicine made from ginger, pepper and honey, which helps digestion before a day of heavy festive eating.  \n\nColoured sand on floor laid out in design\nOutside the front door, women draw delicate white floor patterns called kolam using fine rice flour. Families then exchange traditional homemade sweets like Mysore pak alongside crunchy rice snacks like murukku. In rural parts of Telangana and Andhra Pradesh, children make tall paper lanterns and hang them from long bamboo poles, lighting up quiet village lanes late into the night. \n\nFurther east and northeast, in states like West Bengal, Odisha, Assam, and Manipur, local rivers, forests, and natural materials shape the way the festival looks. In coastal towns near big rivers, people place tiny lit clay lamps inside small boats made from banana tree bark and set them floating down the river current, creating long pathways of light on the dark water. In Odisha, families gather in open fields in the evening to light bundles of dried jute sticks, sending sparks into the sky while singing traditional chants for the wellbeing of their extended family. \n\nIn the northeastern states, local craftsmanship takes centre stage. Instead of using only clay lamps, people weave beautiful lanterns out of thin bamboo strips and brightly coloured paper. Farmers also place tall bamboo poles carrying small lamps right in the middle of their green paddy fields, a practical custom that helps keep crop pests away while making the fields look magical at night.  \n\nAcross Assam, neighbours gather on open verandas to share hot tea alongside traditional sweet rice cakes known as pitha. \n\nEven though morning routines, food recipes, home decorations, and local art forms differ from one state to another, the basic spirit of Diwali remains the same throughout India. It is a reminder to start fresh, clean up our spaces, appreciate the changing season, and bring people closer together through shared food and warm lights. Through a simple oil lamp in porch, a rice-flour design on a village doorway, or a hanging paper lantern, Diwali brightens the natural warmth and diversity of Indian culture. \n\nAvnita studies BSc Business Administration in India.','2026-11-11 05:13:32.705677','Student Ambassador Avnita shares her experience of how Diwali is celebrated across India, showing how every region has its own unique flavour.','2026-11-11 16:26:10.796583',5,'APPROVED',NULL,NULL,NULL),(5,NULL,'Không có gì để bàn','2026-11-11 16:31:42.201644','Ngọc Bích Đẹp Gái','2026-11-12 05:16:46.963521',11,'REJECTED','You are very beautiful not table but not approriate',NULL,NULL),(6,NULL,'sadasd','2026-11-11 16:59:23.353604','sadsad','2026-11-12 05:16:28.493707',11,'REJECTED','?',NULL,NULL),(7,NULL,'Prelude:<div>\nBefore I get into the review, I wanted to write down a few thoughts before I see the movie. As I am writing this, I will be seeing “Spider-Man No Way Home” in eight hours. \n\nThis movie already means a lot to me. I’ve grown up watching and loving all the Spider-Man movies, even the bad ones like “Spider-Man 3” and “The Amazing Spider-Man 2.” While my opinions on most of these movies have gone down as I’ve gotten older and more cynical, I can’t help but enjoy all these movies, which are like a direct shot of nostalgia into my veins. These movies are a major part of my childhood, and this movie is finally the culmination of almost 20 years of filmmaking. \n\nThis may seem weird or redundant, but I think it’s important to acknowledge the significance of this movie away from the hype, online discourse, and the movie itself. This is arguably on the same level as “Endgame,” because it’s bringing together every live-action Spider-Man movie dating back to what arguably put superhero movies back on the map in 2002. \n\nRegardless of the movie’s quality, that’s a huge accomplishment. I had originally approached this movie with skepticism, because I did not like the idea of having Spider-Man deal with the multiverse this early in his career and thought the movie would be a massive dump of fan service, but now that trailers and reviews are out all confirming that this would be the most personal and emotionally resonant MCU Spider-Man movie, I am more excited than I’ve ever been for a Spider-Man movie. \n\nFurthermore, the idea of Matt Murdock, AKA Daredevil, being in this makes me ecstatic even if it’s for only a few minutes. Daredevil is my all-time favorite Marvel or DC project, and Matt Murdock is my favorite MCU character, so to not only see him back but finally on the big screen with Spider-Man is a dream come true for me. Now that I’m done feeling like a little kid again, let’s see what future me thought of “Spider-Man No Way Home.”\n\n \n\nReview:\n\nBefore I jump in, this review has full spoilers. It’s been a month-and-a-half now, and this is a really difficult movie to talk about without discussing spoilers, so you have been warned.\n\nIn short “Spider-Man: No Way Home” is fantastic and I highly recommend anyone who has even a mild interest in Spider-Man to go see it. To be clear, you should watch every single live-action Spider-Man movie along with the Avengers movies before seeing this movie for it to make sense but also for it to have emotional weight. It is the ultimate Spider-Man movie, not only through villains and cameos but also because of the themes and messages at play here. Despite this movie having countless cameos and Spider-Man references from the past 20 years this movie feels especially grounded compared to other Marvel event movies because the movie is centered around Peter’s struggle to be Spider-Man.\n\nI’ll start with some criticisms first because I really don’t have many.\n\nFirstly, I wasn’t a huge fan of the legacy Spider-Man villains outside of Green Goblin and Doc Ock. The lizard was mostly a joke character throughout the movie, Sandman had some awkward placement in the movie and his motivations don’t quite mesh with how “Spider-Man 3” ended, and Electro has a stark personality shift that is quite jarring going from “The Amazing Spider-Man 2.” Thankfully, Alfred Molina and Willem Dafoe kill it in this movie, which were the two most important villains to get right. It’s just a shame that the Sam Raimi villains get to shine so much, while the villains from the Marc Webb movies get the back burner, which kind of undercuts this being a celebration of Spider-Man movies, and makes it feel more like a celebration of the Raimi movies sometimes. There were some good callbacks and character moments for each of them though, such as Andrew Garfield’s conversation with Electro in the final battle.\n\nI also have a major issue with this movie’s aversion to the mention of MCU Uncle Ben. This is a problem throughout all the MCU Spider-Man appearances, since his debut in “Civil War,” but it becomes especially apparent here. This movie has so many chances to mention Uncle Ben and his impact on Peter, but it never does. I get that they didn’t want to tread old ground, but Uncle Ben is just as important to Spider-Man as Thomas and Martha Wayne are to Batman, and it’s odd how all these movies never directly mention him. Even worse is that the other Spider-Men mention their Uncle Bens, but Tom Holland’s just doesn’t, which almost implies he didn’t exist here or play an important role in maturing Peter into his role as Spider-Man.\n\nLastly, the first act had some messy pacing. It has a breakneck pace and almost feels like it’s trying to get to the “good stuff” rather than properly setting up acts 2 and 3. The most telling part is the  scene where Peter and his friends get arrested and brought to the police station for questioning. It’s given a good amount of screen time, yet in the next scene everything is fine and dandy with all their legal troubles cleared. It’s obvious there were other scenes filmed addressing this, especially since all the leaks and rumors saying that there was a court scene with Matt Murdock defending Peter, along with a scene of Matt talking to Peter in the interrogation room. The first act needed an extra 15-20 minutes to properly set up Peter’s motivations for going to Dr. Strange and show the widespread ramifications of his identity being revealed beyond JJJ propagating Alex Jones-type conspiracy theories.\n\nEverything else about this movie, for the most part, is fantastic.\n\nLike I said before, the first act has some issues, but it is still a fun and engaging time. This portion of the movie is the most similar to the previous two movies, as it continues the high school comedy tone that has become synonymous with these movies, but here it feels a little different, because it feels like this aspect is slowly falling apart as it does for Peter. The movie extensively shows the effects of Peter’s identity being revealed on him and his friends. Rapid conspiracy theories emerge around Spider-Man, bricks get thrown through his window, he gets arrested and put on trial, he has to be escorted into the school as everyone stares at him like he has the cheese touch, and he gets rejected from college because of the negative publicity he would bring. For the first time in the trilogy, it feels like Peter has real and impactful consequences to his actions, which only increases as the movie progresses.\n\nThis movie marks the return of Charlie Cox as Matt Murdock, also known as Daredevil; though he only has a short cameo. I love Netflix’s “Daredevil” and it is by far my favorite project in the MCU and of any superhero property for that matter. Seeing my favorite MCU character finally return was immensely exciting. The scene he stars in is fantastic. My only issue is that it wasn’t longer, because according to Tom Holland and some other sources, Matt and Peter were supposed to have a heartfelt conversation on what it meant to be a superhero, which would’ve been an excellent setup for Peter’s arc throughout the movie. Nevertheless, I am ecstatic Charlie Cox is back.\n\nAct 2 is where the movie starts to bring in what everyone came for and once the legacy villains from other Spider-Man movies come, the movie kicks into overdrive. This is the main event and it surely didn’t disappoint.\n\nAlfred Molina, Doc Ock, and Willem Dafoe, Green Goblin, both give fantastic performances, and in the case of Willem, I’d argue even surpasses his original performance as Norman Osborn from 2002. One thing that worried me about this movie is that they would cheapen the ending of “Spider-Man 2” by reverting Doc Ock into a villain, and while that somewhat stands for a bit of the movie, they do the character justice by retaining the arc he went through in his original appearance. Willem Dafoe’s Green Goblin cements himself as one of Marvel’s greatest villains here. In every scene he’s in, he has an eerie and intimidating presence and has more quotable lines than even Thanos, such as “Gods don’t have to choose. We take.” and “Peter. You’re struggling to have everything you want while the world tries to make you choose.” Despite them not having a direct connection in this movie, like the original, Peter and Goblin’s dynamic and rivalry is even better here and this movie hones in on how much of a threat the Green Goblin truly is, which is something I think was lost in the original Sam Raimi movies. This movie gives the sense that he is the penultimate Spider-Man villain; in just one day of knowing this Peter, Norman irreparably changes his life forever.\n\nThe main attraction of this movie, though, was definitely the return of both Andrew Garfield and Tobey Maguire as their respective versions of Spider-Man. Both of these characters were perfectly done. They feel like the same characters they were when we left them off in “Spider-Man 3” and “The Amazing Spider-Man 2.” They feel like natural progressions of each iteration of Spider-Man, and I also loved how they gave both characters satisfying conclusions to their original characters such as Tobey Maguire preventing Green Goblin from being impaled by his own glider, opposite to what happened in “Spider-Man,” and Andrew Garfield saving MJ from a great fall, unlike what happened with Gwen Stacy in “The Amazing Spider-Man 2.” The dynamic between the three Spider-Men is fantastic. They highlight the differences between each one while also showing how each one is great in their own way. \n\nOf course, I have to talk about Tom Holland’s Spider-Man, since it is still his movie and wow, he really steps it up here from his already great job as Peter Parker. This movie puts Peter through the wringer and Tom delivers that perfectly through Peter’s sadness, anger, and personal conflict. This is the first time in the MCU that Peter really has to struggle with power and responsibility and the way this movie delivers it is just amazing. This movie really makes Peter live up to the mantle of Spider-Man, because he is now faced with extensive choices and consequences that have a tangible impact on his life. This movie also highlights what I like most about Spider-Man, which is his empathy. Peter’s life sucks and the world constantly tries to put him down, but despite that, he moves past it and still remains a hero. What makes the character so inspiring to millions of fans is how he rises above the hardships in life and continues to do the right thing. By the end of this movie, Peter finally feels like the Spider-Man we know and love. Before, Peter may have heard the phrase “with great power comes great responsibility,” but this is where he actually has to put that idea to the test. \n\nI also really loved how this movie treats every Spider-Man movie with reverence and respect. It doesn’t make fun of or bastardize the ones that came before it, even the bad and unpopular ones. This was a major pitfall in “Star Wars The Rise of Skywalker” and I’m thankful it wasn’t replicated here. It truly does feel like the ultimate celebration of Spider-Man, because it has something for fans of every era, while also telling a great story in its own right. I’m thankful this movie exists and that it’s as good as it is. “No Way Home” tells the quintessential Spider-Man story on the big screen and I highly recommend anyone with even a passing interest in the character to watch this movie.\n\n \n\nScore: 9/10</div>','2026-11-11 17:17:48.111942','Spiderman','2026-11-12 09:06:37.392109',4,'APPROVED',NULL,'Spiderman','/uploads/posts/92997000-436e-4947-8404-507ea5d1d6e0.jpg');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt48xdq560gs3gap9g7jg36kgc` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (2,'Competition'),(3,'Review');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ROLE_ADMIN','ROLE_STUDENT','ROLE_TEACHER') NOT NULL,
  `username` varchar(50) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-11-05 04:39:20.611518','khai@example.com','password123','ROLE_STUDENT','student_khai',1,1),(2,'2026-11-05 04:39:20.634153','admin@example.com','password123','ROLE_TEACHER','lecturer_admin',1,1),(3,'2026-11-06 05:24:48.166659','b@b.com','$2a$10$gLUVY9cqzzUxHW2EwCSSoOLtBqDUqCuRsA.WlQlX9pd2heVcfG8Hm','ROLE_STUDENT','khai2',1,1),(4,'2026-11-08 11:43:54.337929','khai.buiminh05@gmail.com','$2a$10$4HGMB4N2OyCJoays3GS91O3mwssu/ds6.gVZgRiPPld73xjUboJCy','ROLE_ADMIN','khai.buiminh05',1,1),(5,'2026-11-08 11:44:11.286385','minhkhai3105@gmail.com','$2a$10$1JLoWyNlrY597GHroj7.Ze.E8kkSlom3yQylDyuNfgo9RABdA1fFS','ROLE_STUDENT','minhkhai3105',1,1),(6,'2026-11-09 07:34:53.076637','52300033@student.tdtu.edu.vn','$2a$10$cSkbsyhf1YjM.IGuxkQ7yOyNYsghTohENbeviyiSSMXkXzcf0wihm','ROLE_STUDENT','52300033',1,1),(10,'2026-11-11 04:07:41.375507','minhkhai12309@gmail.com','$2a$10$i1B5BACs9s0Q6Js.Y2LKX.y4uUtYdx6Cn.Zg1ftuH45of9QEm7trK','ROLE_STUDENT','minhkhai123',1,1),(11,'2026-11-11 16:30:19.305962','tbich7084@gmail.com','$2a$10$AuZBQ6Pu6aoytSesd/KSOuTagACFP2VVtcBDQsTP0tvzDzEK0Cobq','ROLE_STUDENT','ngocbich',1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-12 22:08:09
