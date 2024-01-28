from flask import Flask, request, jsonify, render_template
import erniebot
erniebot.api_type = 'aistudio'
erniebot.access_token = '3e378d54f90bc7e442601109a627cef93d5d2b0d'

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('map.html')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json.get('message')
    # 在这里执行对话处理逻辑，假设这里简单地将消息原样返回
    responseFromErnie = erniebot.ChatCompletion.create(
    model='ernie-3.5',
    messages=[{
        'role': 'user',
        'content':message
    }])
    
    response = {'message': responseFromErnie.get_result()}
    print(response) 
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
