express <appname> (consider express --sessions -css less <appname>)
cd ./funtasy
copy a .gitignore
create this README.md
git init
git add .
git commit -am "<message>"
--------------
Set up remote repository on Github
git remote add origin git@github.com:nweintraut/<appname>.git
git push -u origin master
---------------
Set-up for Heroku
Create a Profile with web: app.js
Edit package.json to include version for node and npm engines

git it
heroku apps:create <appname>
git push heroku master
git push heroku --tags (need to do this; git doesn't autmoatically push tags)
git push origin master

can use: heroku open (opens a web browser point to the heroku app).

heroku ps:scale web=1
heroku ps
heroku config:add NODE_ENV=production
heroku open
