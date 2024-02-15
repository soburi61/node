import requests
from bs4 import BeautifulSoup
import sys

def get_kosen_url(kosen):
    url = "https://syllabus.kosen-k.go.jp"
    try:
        res = requests.get(url)
        res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"URL: {url} へのリクエスト中にエラーが発生しました: {e}")
        return []

    kosen_soup = BeautifulSoup(res.content, "html.parser")

    # kosen名のURLを探す
    kosen_anchor = kosen_soup.find("a", string=kosen)
    if not kosen_anchor:
        print(f"学校名 '{kosen}' が見つかりませんでした。")
        return []
    kosen_url = url + kosen_anchor.get('href')

    return kosen_url

if __name__ == "__main__":
    kosen = sys.argv[1]
    print(get_kosen_url(kosen))