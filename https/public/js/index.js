function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

$(document).ready(async function() {
    if (!navigator.onLine) {
        let offline = '';
        offline += 'You are currently playing whovie.org in offline mode. ';
        offline += 'We currently have over 100 trivia questions and over 400 rounds in offline mode.'
        await message('warning', offline);
    }

    let goMsg = 'You have reached the end! Go to moviebomber.org to test your true skills.';
    let span = document.createElement('span');
    span.classList.add('swal-text');

    let span2 = document.createElement('span');
    span2.classList.add('swal-text');

    let currentMovieIndex = 0;
    let whovieScore = 0;
    let whovieLives = 6;

    let currentQuestionIndex = 0;
    let triviaScore = 0;
    let triviaLives = 6;

    let movieResponse = await fetch('/api/data/list/0');
    let movieDataAll = await movieResponse.json();
    let movieData = [];
    let defaultList = '109087';
    setList(defaultList);

    let questionResponse = await fetch('/api/data/trivia/questions');
    let questionData = await questionResponse.json();

    let whovieRemaining = movieData.length;
    let whovieAnswered = 0;
    
    let triviaRemaining = questionData.length;
    let triviaAnswered = 0;

    setStats();
    setWhovieStats();
    setTriviaStats();

    shuffle(movieData);
    shuffle(questionData);

    loadMovie();
    loadQuestion();

    $('.button.actor').click(async function() {
        let guess = $(this).text();
        let correctChoices = movieData[currentMovieIndex].correct;
        let correct = correctChoices.find(choice => choice == guess);
        let msg = '';

        whovieAnswered = whovieAnswered + 1;
        whovieRemaining = whovieRemaining - 1;
        setWhovieStats();
            
        if (correct) {
            await message('success', 'Correct');
            whovieScore = whovieScore + 1;
            setStats();
        } else {

            try {
                let right = await findCorrect(correctChoices);
                span.innerHTML = `Incorrect<br>${right}`;
                await message2('error', span);
            } catch (err) {
                await message('error', 'Incorrect');
                console.log(err);
            }
            
            whovieLives = whovieLives - 1;
            setStats();

            if (whovieLives <= 0) {
                await message('error', 'Game Over!');
                reset('whovie', defaultList);
            }
        }

        try {
            currentMovieIndex = currentMovieIndex + 1;
            loadMovie();
        } catch (err) {
            await message('info', goMsg);
            reset('whovie', defaultList);
        }
    });

    $('.button.question').click(async function() {
        let guess = $(this).text();
        let correct = questionData[currentQuestionIndex].choices['correct'];

        triviaAnswered = triviaAnswered + 1;
        triviaRemaining = triviaRemaining - 1;
        setTriviaStats();
        
        if (correct === guess) {
            await message('success', 'Correct!');
            triviaScore = triviaScore + 1;
            setStats();
        } else {
            span2.innerHTML = `Incorrect<br>${correct}`;
            await message2('error', span2);
            triviaLives = triviaLives - 1;
            setStats();

            if (triviaLives <= 0) {
                await message('error', 'Game Over!');
                reset('trivia');
            }
        }

        try {
            currentQuestionIndex = currentQuestionIndex + 1;
            loadQuestion();
        } catch (err) {
            await message('info', goMsg);
            reset('trivia');
        }
    });

    $('select').change(async function() {
        let id = $('select option:selected').val();
        let go = await confirmMessage('Are you sure that you want to switch movie lists?');
        if (go) {
            switchList(id);
        }
    });

    function switchList(id) {
        reset('whovie', id);
    }

    function reset(mode, listID) {
        if (mode === 'whovie') {
            currentMovieIndex = 0;
            whovieLives = 6;
            whovieScore = 0;
            setStats();

            setList(listID);

            whovieAnswered = 0;
            whovieRemaining = movieData.length;
            setWhovieStats();

            shuffle(movieData);
            loadMovie();
        } else {
            currentQuestionIndex = 0;
            triviaLives = 6;
            triviaScore = 0;
            setStats();

            triviaAnswered = 0;
            triviaRemaining = questionData.length;
            setTriviaStats();

            shuffle(questionData);
            loadQuestion();
        }
    }

    async function message(icon, text) {
        return await swal({
            icon: icon,
            text: text,
            closeOnClickOutside: false
        });
    }

    async function message2(icon, content) {
        return await swal({
            icon: icon,
            content: content,
            closeOnClickOutside: false
        });
    }

    async function confirmMessage(text) {
        return await swal({
            icon: 'warning',
            text: text,
            buttons: {
                cancel: true,
                confirm: true,
            },
            closeOnClickOutside: false
        });
    }

    function setStats() {
        $('#whovie-lives').text(whovieLives);
        $('#whovie-score').text(whovieScore);
        $('#trivia-lives').text(triviaLives);
        $('#trivia-score').text(triviaScore);
    }

    function setTriviaStats() {
        $('#trivia-answered').text(triviaAnswered);
        $('#trivia-remaining').text(triviaRemaining);
    }

    function setWhovieStats() {
        $('#whovie-answered').text(whovieAnswered);
        $('#whovie-remaining').text(whovieRemaining);
    }

    function setList(id) {
        movieData = movieDataAll.filter(data => data.listID == id);
    }

    async function findCorrect(correctChoices) {
        let buttonValues = [];

        $('.button.actor').each(function() {
            buttonValues.push($(this).text());
        });

        return new Promise((resolve) => {
            for (const value of buttonValues) {
                for (const correctChoice of correctChoices) {
                    if (correctChoice === value) {
                        resolve(value);
                        break;
                    }
                }
            }
        });
    }

    function loadMovie() {
        let movie = movieData[currentMovieIndex];
        let choices = [];

        shuffle(movie.correct);

        choices.push(movie.correct[0])

        movie.incorrect.forEach(choice => {
            choices.push(choice);
        });

        shuffle(choices);

        $('#title').text(movie.title);
        $('#overview').text(movie.overview);
        $('.button.actor').each(function(index) {
            $(this).text(choices[index]);
        });
    }

    function loadQuestion() {
        let question = questionData[currentQuestionIndex];
        let choices = Object.values(question.choices);
        shuffle(choices);
        $('#question').text(question.question);
        $('.button.question').each(function(index) {
            $(this).text(choices[index]);
        });
    }
});