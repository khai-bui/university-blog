FROM maven:3.9-eclipse-temurin-25 AS builder
WORKDIR /workspace

COPY pom.xml ./
RUN mvn -q dependency:go-offline

COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app

COPY --from=builder /workspace/target/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
