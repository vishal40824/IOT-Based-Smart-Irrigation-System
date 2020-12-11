import speech_recognition as sr

r = sr.Recognizer()
with sr.Microphone() as source:
    audio = r.listen(source)
    try:
        text = r.recognize_google(audio)
        print(text, end="")
    except:
        print("Sorry could not recognize what you said", end="")