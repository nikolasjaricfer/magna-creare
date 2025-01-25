package test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.WebElement;

public class T10 {

	public static void main(String[] args) throws InterruptedException {
		
		System.setProperty("webdriver.chrome.driver", "C:\\Users\\matija\\Selenium WebDriver\\Chrome Driver\\chromedriver-win64\\chromedriver.exe");
		
		WebDriver driver = new ChromeDriver();
		
		try {
		
			driver.get("http://localhost:3000/");
		
			Thread.sleep(2000);
		
			WebElement usernameField = driver.findElement(By.xpath("//input[contains(@type, 'text')]"));
			usernameField.sendKeys("test1");

			Thread.sleep(1000);
        
			WebElement passwordField = driver.findElement(By.xpath("//input[contains(@type, 'password')]"));
			passwordField.sendKeys("sifra1");

			Thread.sleep(1000);
        
			WebElement loginButton = driver.findElement(By.xpath("//button[text()='Login']"));
			loginButton.click();
        
			Thread.sleep(5000);
        
			driver.findElement(By.xpath("(//button[@id=\'navButtons\'])[4]")).click();
			
			Thread.sleep(1000);
			
		    driver.findElement(By.id("quizInput")).click();
		    driver.findElement(By.id("quizInput")).sendKeys("kviz");
		    
		    Thread.sleep(1000);
		    
		    driver.findElement(By.cssSelector("select:nth-child(2)")).click();
		    driver.findElement(By.xpath("//option[. = 'General knowledge']")).click();
		    
		    Thread.sleep(1000);
		    
		    driver.findElement(By.cssSelector(".pac-target-input")).click();
		    driver.findElement(By.cssSelector(".pac-target-input")).sendKeys("Zagreb");
		    driver.findElement(By.cssSelector(".pac-target-input")).sendKeys(Keys.ENTER);
		    
		    Thread.sleep(1000);
		    

		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[2]")).click();
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[2]")).sendKeys("10");
		    
		    Thread.sleep(1000);
		    
		    
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[3]")).click();
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[3]")).sendKeys("5");
		    
		    Thread.sleep(1000);
		    
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[5]")).click();
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[5]")).sendKeys("88");
		    
		    Thread.sleep(1000);
		    
		    driver.findElement(By.cssSelector("select:nth-child(11)")).click();
		    driver.findElement(By.xpath("//option[. = 'Easy']")).click();

		    Thread.sleep(1000);
		    
		    driver.findElement(By.cssSelector("textarea")).click();
		    driver.findElement(By.cssSelector("textarea")).sendKeys("kdkd");
		    
		    Thread.sleep(1000);
		    
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[7]")).click();
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[7]")).sendKeys("nagrada");
		    
		    Thread.sleep(1000);
		    
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[4]")).click(); 
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[4]")).sendKeys("25-01-2025");
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[4]")).sendKeys(Keys.ARROW_RIGHT);
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[4]")).sendKeys("18:17");
		    
		    Thread.sleep(1000);
		    
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[6]")).click();
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[6]")).sendKeys("25-01-2025");
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[6]")).sendKeys(Keys.ARROW_RIGHT);
		    driver.findElement(By.xpath("(//input[@id=\'quizInput\'])[6]")).sendKeys("17:17");
		   
		    Thread.sleep(1000);
		    
		    driver.findElement(By.xpath("//button[contains(.,\'Submit Quiz\')]")).click();
			
			System.out.println("Test uspješan!");
			

		} catch (Exception e) {

			System.out.println("Test neuspješan!");
			
        } finally {
            
        //	driver.quit();
        
        }
    
	}

}
