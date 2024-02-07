import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt
import datetime
import sys
import json
#--定義--
# 重要度、締切日（日付）、タスクの軽さを入力変数とします
importance = ctrl.Antecedent(np.arange(0, 11, 1), 'importance')
lightness = ctrl.Antecedent(np.arange(0, 11, 1), 'lightness')
deadline = ctrl.Antecedent(np.arange(0, 61, 1), 'deadline')


# 優先度を出力変数とします
priority = ctrl.Consequent(np.arange(0, 101, 1), 'priority')

# 各変数のファジィ集合を定義します
importance['low'] = fuzz.trimf(importance.universe, [0, 0, 5])
importance['medium'] = fuzz.trimf(importance.universe, [0, 5, 10])
importance['high'] = fuzz.trimf(importance.universe, [5, 10, 10])

lightness['light'] = fuzz.trimf(lightness.universe, [0, 0, 5])
lightness['medium'] = fuzz.trimf(lightness.universe, [0, 5, 10])
lightness['heavy'] = fuzz.trimf(lightness.universe, [5, 10, 10])

deadline['near'] = fuzz.trimf(deadline.universe, [0, 0, 15])
deadline['medium'] = fuzz.trimf(deadline.universe, [10, 30, 50])
deadline['far'] = fuzz.trimf(deadline.universe, [30, 60, 60])

priority['low'] = fuzz.trimf(priority.universe, [0, 0, 50])
priority['medium'] = fuzz.trimf(priority.universe, [0, 50, 100])
priority['high'] = fuzz.trimf(priority.universe, [50, 100, 100])

# ルールを定義
rule1 = ctrl.Rule(importance['low'] | deadline['far'] | lightness['light'], priority['low'])
rule2 = ctrl.Rule(importance['medium'] | deadline['medium'] | lightness['medium'], priority['medium'])
rule3 = ctrl.Rule(importance['high'] | deadline['near'] | lightness['heavy'], priority['high'])
rule4 = ctrl.Rule(deadline['near'] & lightness['heavy'], priority['high'])
# ルールを制御システムに追加
priority_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
#------



def calc_task_priority(importance_value, lightness_value, deadline_date):


    # 制御システムをシミュレーションに接続します
    priority_eval = ctrl.ControlSystemSimulation(priority_ctrl)

    # 具体的な入力値を設定します
    priority_eval.input['importance'] = importance_value
    priority_eval.input['lightness'] = lightness_value
    # 締切日を日付または時間形式から数値に変換し、適切な値を設定します
    current_date = datetime.datetime.now()  # 現在の日付を取得
    days_until_deadline = (deadline_date - current_date ).days
    days_until_deadline +=5
    # 2ヶ月以内の場合はスケーリング
    if days_until_deadline >= 60:
        days_until_deadline = 60  # 2ヶ月以上は60に設定
    priority_eval.input['deadline'] = days_until_deadline
    
    # 優先度を計算します
    priority_eval.compute()
    
    # 優先度を返します
    return priority_eval.output['priority']





if __name__ == "__main__":
    # コマンドライン引数を取得
    args = sys.argv[1:]  # 最初の引数はファイル名なので除外

    # 引数が3つであることを確認
    if len(args) != 3:
        print("引数は3つです")
        print( datetime.datetime.now())
        sys.exit(1)
    importance_value = int(args[0])
    lightness_value = int(args[1])
    deadline_date = datetime.datetime.strptime(args[2], "%Y-%m-%d")  # 文字列をdatetime.datetime型に変換
    priority = calc_task_priority(importance_value, lightness_value, deadline_date)
    print(json.dumps(priority))
    



