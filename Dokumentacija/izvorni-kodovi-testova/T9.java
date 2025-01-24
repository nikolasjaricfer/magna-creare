package test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.WebElement;

public class T9 {

	public static void main(String[] args) throws InterruptedException {
		
		System.setProperty("webdriver.chrome.driver", "C:\\Users\\matija\\Selenium WebDriver\\Chrome Driver\\chromedriver-win64\\chromedriver.exe");
		
		WebDriver driver = new ChromeDriver();
		
		try {
		
			driver.get("http://localhost:3000/");
		
			Thread.sleep(2000);
		
			WebElement usernameField = driver.findElement(By.xpath("//input[contains(@type, 'text')]"));
			usernameField.sendKeys("test");

			Thread.sleep(1000);
        
			WebElement passwordField = driver.findElement(By.xpath("//input[contains(@type, 'password')]"));
			passwordField.sendKeys("sifra");

			Thread.sleep(1000);
        
			WebElement loginButton = driver.findElement(By.xpath("//button[text()='Login']"));
			loginButton.click();
        
			Thread.sleep(5000);
			
			WebElement searchbar = driver.findElement(By.xpath("//input[@id='searchbar']"));
			searchbar.sendKeys("Test");
			searchbar.sendKeys(Keys.ENTER);
			
			Thread.sleep(2000);
        
			System.out.println("Test uspješan!");
			

		} catch (Exception e) {
			
			System.out.println("Test neuspješan!");
			
        } finally {
            
        	//driver.quit();
        
        }
    
	}

}