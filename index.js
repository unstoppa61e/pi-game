#!/usr/bin/env node

'use strict'

{
  const { Select } = require('enquirer')
  const chalk = require('chalk')

  class PracticeMode {
    constructor () {
      this.pi = '3.1415'
    }


  }

  class Game {
    constructor () {
      const welcomeMessage = '>'.repeat(10) + ' PI GAME ' + '<'.repeat(10)
      console.log(chalk.bold.green(welcomeMessage))
      const sqlite3 = require('sqlite3').verbose()
      this.db = new sqlite3.Database('./high_scores.db')
      this.db.run('create table if not exists notes(id integer primary key, score integer)')
      this.practiceMode = 'PRACTICE MODE'
      this.realMode = 'REAL MODE'
      this.showPiDigits = 'SHOW PI DIGITS'
      this.highScores = 'HIGH SCORES'
      this.pi = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
    }

    start () {
      const modes = [
        { name: this.practiceMode, explanation: 'Check how many digits of pi you can name from the digit you set beforehand.' },
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
          return '\n' + explanations[this.index]
        }
      })
      prompt.run()
        .then(answer => {
          switch (answer) {
            case this.practiceMode:
              break;
            case this.realMode:
              break;
            case this.showPiDigits:
              this.showPi()
              break;
            case this.highScores:
              break;
          }
          this.start()
        })
    }

    startPracticeMode () {
    }

    showPi () {
      // require('keypress')(process.stdin)
      //   console.log('1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679' + '\n\nPress any key to finish.')
      // console.log('1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679' + '\n')
      // process.stdin.on('keypress', (ch, key) => {
      //   console.clear()
      // })
      // process.stdin.setRawMode(true);
      // process.stdin.resume();
      let sectionHeadIndex = 2
      const sectionDigits = 10
      let pi_text = this.pi.slice(0, 2)
      for (let i = 0; i < 10; i++) {
        if (i !== 0) {
          pi_text += ' '
        }
        pi_text += this.pi.substr(sectionHeadIndex + sectionDigits * i, 10)
      }
      console.log(pi_text)
    }

    // async keypress () {
    //   process.stdin.setRawMode(true)
    //   return new Promise(resolve => process.stdin.once('data', data => {
    //     const byteArray = [...data]
    //     if (byteArray.length > 0 && byteArray[0] === 3) {
    //       console.log('^C')
    //       process.exit(1)
    //     }
    //     process.stdin.setRawMode(false)
    //     resolve()
    //   }))
    // }
  }
// (async () => {
  new Game().start()
//
// })
}
