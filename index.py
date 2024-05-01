from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.common.by import By
import time

options = Options()
options.headless = False  # Bu satırı True olarak ayarlayarak arka planda çalışmasını sağlayabilirsiniz

output = []

def process_category(category):
    url_ae = f"https://www.amazon.ae/s?k={category.replace(' ', '+')}"

    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=options)

    driver.get(url_ae)
    driver.maximize_window()

    first_a_element = driver.find_element(By.XPATH, "//div[@id='departments']//a")
    href_value = first_a_element.get_attribute("href")
    driver.get(href_value)

    search_button = driver.find_element(By.XPATH, "//input[@id='nav-search-submit-button']")
    search_button.click()
    time.sleep(2)  # Sayfanın tamamen yüklenmesini bekleyin

    current_url_ae = driver.current_url
    
    first_a_element_ae = driver.find_element(By.XPATH, "//div[@id='departments']//a")
    first_a_element_ae.click()
    time.sleep(2)  # Kategoriye tıklamayı bekleyin

    search_button_ae = driver.find_element(By.XPATH, "//input[@id='nav-search-submit-button']")
    search_button_ae.click()
    time.sleep(2)  # Arama butonuna tıklamayı bekleyin

    current_url_ae_final = driver.current_url

    category_url_com = current_url_ae_final.replace("amazon.ae", "amazon.com")
    
    driver.get(category_url_com)
    time.sleep(2)  # Sayfanın tamamen yüklenmesini bekleyin

    first_a_element_com = driver.find_element(By.XPATH, "//div[@id='departments']//a")
    first_a_element_com.click()
    time.sleep(2)  # Kategoriye tıklamayı bekleyin

    search_button_com = driver.find_element(By.XPATH, "//input[@id='nav-search-submit-button']")
    search_button_com.click()
    time.sleep(2)  # Arama butonuna tıklamayı bekleyin

    current_url_com = driver.current_url

    driver.quit()

    return current_url_ae, current_url_com

# data.txt dosyasını oku
with open('data.txt', 'r') as file:
    dataFile = file.read()

# İçeriği bir liste olarak ayır
categories = dataFile.strip().strip('').split(', ')

# Her bir öğeyi işle
for category in categories:
    if category == ', ':
        break
    else:
        url_ae, url_com = process_category(category)
        output.append(url_ae)
        output.append(url_com)
        
with open('data.txt', 'w') as file:
    file.write("\n".join(output) + "\n")
