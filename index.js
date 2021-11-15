#!/usr/bin/env node

'use strict'

{
  const PI_TEXT = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
  const PI_START_TEXT = '3.'
  const PI_BELOW_THE_DECIMAL_POINT = '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
  const { Select } = require('enquirer')
  const chalk = require('chalk')

  class PracticeMode {
    constructor (pi_text = PI_TEXT) {
      this.pi_text = pi_text
    }

    start () {
      const prompt = this.getStartingPointPrompt()
      prompt.run()
        .then(answer => {
          if (answer < 1 || answer > 100) {
            console.log(chalk.bold.red('Your input is out of the range.'))
            process.exit()
          }
          const startIndex = answer - 1
          this.startTypingSession(startIndex)
        })
        .catch(console.error)

    }

    startTypingSession (startIndex = 0) {
      const instruction = 'Keep typing in the number which fits the cursor position.'
      let currentIndex = startIndex
      process.stdout.write(chalk.bold.green(instruction) + '\n\n' + PI_START_TEXT + PI_BELOW_THE_DECIMAL_POINT.slice(0, startIndex))
      const readline = require('readline');
      readline.emitKeypressEvents(process.stdin)
      process.stdin.setRawMode(true);
      process.stdin.on('keypress', (char, key) => {
        if (key.ctrl && key.name === 'c') {
          process.exit();
        } else if (currentIndex === 100) {
          this.putsCongratulations()
          process.exit();
        } else if (char === PI_BELOW_THE_DECIMAL_POINT[currentIndex]) {
          process.stdout.write(char)
          currentIndex++
        } else {
          const scoreMessage = `Your score: ${chalk.bold.green(currentIndex)}`
          const remaining_digits_text = this.make_remaining_digits_text(currentIndex)
          console.log(chalk.red(remaining_digits_text) + '\n\n' + scoreMessage)
          process.exit();
        }
      })
    }


    getStartingPointPrompt () {
      const { NumberPrompt } = require('enquirer')
      return new NumberPrompt({
        name: 'number',
        message: 'Set the starting point(1-100): '
      })
      // prompt.run()
      // return prompt
    }

    putsCongratulations () {
      const headSpaces = ' '.repeat(6)
      const congratulationsSentences = [
        'Congratulations!',
        'You have memorized the first 100 digits of pi.'
      ]
      let congratulations = ''
      congratulationsSentences.forEach(sentence => {
        congratulations += headSpaces + sentence + '\n'
      })
      console.log(chalk.bold.green(congratulations))
    }

    make_remaining_digits_text (currentIndex) {
      let remaining_digits_text = ''
      const digitsNum = 100
      const sectionDigitsNum = 10
      const lineDigitsNum = 50
      for (let i = currentIndex; i < digitsNum; i++) {
        if (i  === lineDigitsNum) {
          remaining_digits_text += '\n' + ' '.repeat(PI_START_TEXT.length)
        } else if (i % sectionDigitsNum === 0) {
          remaining_digits_text += ' '
        }
        remaining_digits_text += PI_BELOW_THE_DECIMAL_POINT[i]
      }
      return remaining_digits_text
    }
  }

  class Game {
    constructor () {
      const sqlite3 = require('sqlite3').verbose()
      this.db = new sqlite3.Database('./high_scores.db')
      this.db.run('create table if not exists notes(id integer primary key, score integer)')
      this.practiceMode = 'PRACTICE MODE'
      this.realMode = 'REAL MODE'
      this.showPiDigits = 'SHOW PI DIGITS'
      this.highScores = 'HIGH SCORES'
      this.pi_text = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
    }

    start () {
      const modes = [
        { name: this.practiceMode, explanation: 'Check how many digits of pi you can name from the point you designated.' },
        { name: this.realMode, explanation: 'Check how many digits of pi you can name.' },
        { name: this.showPiDigits, explanation: 'Check the first 100 digits of pi.' },
        { name: this.highScores, explanation: 'Check the high scores.' }
      ]
      const prompt = new Select({
        name: 'mode',
        message: 'Select your mode:',
        choices: modes.map(mode => mode.name),
        footer () {
          const explanations = modes.map(mode => ' '.repeat(2) + mode.explanation)
          return chalk.green('\n' + explanations[this.index])
        }
      })

      prompt.run()
        .then(answer => {
          switch (answer) {
            case this.practiceMode:
              new PracticeMode(this.pi_text).start()
              break;
            case this.realMode:
              break;
            case this.showPiDigits:
              new ShowPiMode(this.pi_text).start()
              break;
            case this.highScores:
              break;
          }
        })
    }
  }

  class ShowPiMode {
    constructor(pi_text = PI_TEXT) {
      this.pi_text = pi_text
    }
    start () {
      let sectionHeadIndex = 2
      const sectionDigits = 10
      let pi_text = this.pi_text.slice(0, 2)
      for (let i = 0; i < 10; i++) {
        if (i !== 0) {
          pi_text += ' '
        }
        pi_text += this.pi_text.substr(sectionHeadIndex + sectionDigits * i, 10)
      }
      console.log(pi_text)
    }
  }

  const welcomeMessage = '>'.repeat(10) + ' PI GAME ' + '<'.repeat(10)
  console.log(chalk.bold.green(welcomeMessage))

  // This doesn't work as intended.
  // new Game().start()
  // If you run just the next line, it works as intended.
  new PracticeMode().start()
}
