# bibleclient program
# Feb 2010, James Skon
# August 2016, Bob Kasper
# February 2019, Dante Cherubini
# updated February 2018 to use paths on cs2.mvnu.edu

# This is the Makefile for the Bible system demo program
# Copy this directory to a location within your home directory. 
# Change the USER name value below to your own user name.
# Then use "make" to build the server program,
# and deploy it to the live web server directory.
# To test the program, go to http://cs2.mvnu.edu/class/csc3004/dancherubini/
# and click on the bibleclient.html link.
CC= g++
CFLAGS= -g
USER= dancherubini
all:  PutHTML

PutHTML:
		cp XMLBible.html /var/www/html/class/csc3004/$(USER)
		cp XMLBible.js /var/www/html/class/csc3004/$(USER)
		cp BibleStyle.css /var/www/html/class/csc3004/$(USER)
		echo "Current contents of your HTML directory: "
		ls -l /var/www/html/class/csc3004/$(USER)
