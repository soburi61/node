import requests
from bs4 import BeautifulSoup

def scrape_subjects(school, department, grade):
    url = "https://syllabus.kosen-k.go.jp"
    res = requests.get(url)
    school_soup = BeautifulSoup(res.content, "html.parser")

    # kosen名のURLを探す
    school_url = url + school_soup.find("a", string=school).get('href')

    # HTMLを取得
    res = requests.get(school_url)
    school_soup = BeautifulSoup(res.content, "html.parser")
    #print(school_soup.prettify())
    
    # 学科名を含む要素を探す
    department_heading = school_soup.find("h4", string=department)

    # 学科名が見つかった場合、その親要素を取得し、科目一覧のリンクを探す
    if department_heading:
        parent_div = department_heading.find_parent("div", class_="row")
        if parent_div:
            department_url = url + parent_div.find("a", string="本年度の開講科目一覧").get('href')
    
    #見つかったリンクから,htmlを取得
    res = requests.get(department_url)
    department_soup = BeautifulSoup(res.content, "html.parser")
    #print(department_soup.prettify())
    del school_url ,department_heading ,res ,school_soup ,parent_div 
    #ここから科目を取得する
    subject_name = ""
    subject_type = ""
    subject_location = ""
    credit = 0
    # ここから科目を取得する
    subjects_info = []

    # 科目ごとの情報を取得してsubjects_infoに格納
    for subject in department_soup.find_all("div", class_="subject"):
        subject_name = subject.find("h5").text
        subject_type = subject.find("span", class_="type").text
        subject_location = subject.find("span", class_="location").text
        credit = int(subject.find("span", class_="credit").text)
        teachers = [teacher.text for teacher in subject.find_all("span", class_="teacher")]

        subject_info = {
            "subject_name": subject_name,
            "subject_type": subject_type,
            "subject_location": subject_location,
            "credit": credit,
            "teachers": teachers
        }

        subjects_info.append(subject_info)

    return subjects_info

# 高専名、学科名、学年を指定して科目一覧を取得
school = "函館工業高等専門学校"  
department = "生産システム工学科"  
grade = "1"  # 1年生
subjects = scrape_subjects(school, department, grade)

# 取得した科目一覧を表示
for subject in subjects:
    print(subject)