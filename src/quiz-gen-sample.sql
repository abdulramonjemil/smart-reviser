SELECT lesson_quiz  
FROM mindsdb.lesson_quiz_generator  
WHERE questions_count = '5'  
AND lesson_content = '  
6 Creating and editing files A text editor is a program that allows you to
create and edit a simple plain text file. Things like Word allow you to embed
information about fonts, font-size, colour, bold, italics, etc. A text editor
simply deals with the plain characters — some text editors may display text in
colour while you are working on it (for example to highlight syntax while
writing a computer program) but this information is not saved. Under Windows,
you can use NotePad (ensure you save as a ‘plain ASCII text file’), but other
freely-available editors include Atom and vim (also known as vi). On the Mac,
choices include TextEdit or vim. vim is built into the git-bash environment, but
is rather old-fashioned and not easy to use — its advantage is it is available
in every unix-like environment and lots of prgrammers really like it because it
is very fast to start and pretty powerful. It is also the default editor that
Git will use if it expects you to provide information about a change you have
made2 . vim has a ‘command mode’ and a ‘text-entry mode’. When vim starts, it
will be in command mode. To add text, move around using the arrow keys. To start
entering text at the cursor, press the i key (for insert) and start typing. 2You
can change the editor that Git uses by giving the command git config --global
core.editor "editor" replacing editor with the editor you wish to use. 6 When
you are done press the Esc key to return to command mode. To exit the editor,
press Esc to ensure you are in command mode, then type :wq Table 1 summarizes
the most useful commands. 7 Adding files to your Git repository Let’s start by
creating a file to contain some information about proteins. Task: Use a text
editor to create a file in your ∼/git/GitExercise/ directory called proteins.txt
containing the following text: Lysozyme Chicken LYSC_CHICK P00698 Lysozyme Human
LYSC_HUMAN P61626 Hemoglobin-alpha Human HBA_HUMAN P69905 Hemoglobin-beta Human
HBB_HUMAN P68871 Exit your editor and tell Git that you want to track this file:
7: Type the following: git add proteins.txt You only need to do this when you
have a new file that you want to track with Git. Having specified that the file
should be tracked, we need to tell Git that we have made changes to the file
that we want it to record: 8: Type the following: git commit -a -m "Initial
version" Strictly in this case the -a isn’t needed, but it will be whenever you
do this in future so we will put it in3 . The -m specifies the text that follows
in double-inverted commas is a comment (or message) briefly explaining what
changes were made in this version. If you forget to supply a message with -m
then you will enter the (vim) where you can enter text (See the notes above).  
';
