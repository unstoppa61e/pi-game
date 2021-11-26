#!/usr/bin/env node

'use strict'

const piText = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
const piStartText = '3.'
const piBelowTheDecimalPoint = '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
const { Select } = require('enquirer')
const chalk = require('chalk')
const {resolve, reject} = require('eslint-plugin-promise/rules/lib/promise-statics')
const readline = require('readline')
const digitsNum = 100
const piLastIndex = digitsNum - 1

class PracticeMode {
  async start () {
    const prompt = await this.getStartingPointPrompt()
    const answer = await prompt.run()
    if (answer < 1 || answer > digitsNum) {
      console.log(chalk.bold.red('Your input is out of the range.'))
      return this.start()
    }
    const startIndex = answer - 1
    const instruction = 'Keep typing in the number which fits the cursor position.'
    process.stdout.write(chalk.bold.green(instruction) + '\n\n' + piStartText + piBelowTheDecimalPoint.slice(0, startIndex))
    return this.startTypingSession(startIndex)
  }

  // TODO: 多分消す
  prepareProcessStdinForInput () {
    require('readline').emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.resume()
  }

  async startTypingSession (startIndex = 0) {
    return new Promise((resolve, reject) => {
      let currentIndex = startIndex
      const readline = require('readline')
      readline.emitKeypressEvents(process.stdin)
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.on('keypress', (char, key) => {
        if (key.ctrl && key.name === 'c') {
          process.exit();
        } else if (currentIndex === piLastIndex && char === piBelowTheDecimalPoint[piLastIndex]) {
          console.log(piBelowTheDecimalPoint[piLastIndex])
          this.putCongratulations()
          // process.stdin.once('data', () => {
            this.breakLoop(resolve)
          // })
          // this.breakLoop(resolve)
        } else if (char === piBelowTheDecimalPoint[currentIndex]) {
          process.stdout.write(char)
          currentIndex++
        } else {
          const scoreMessage = `Your score: ${chalk.bold.green(currentIndex)}`
          const remaining_digits_text = this.make_remaining_digits_text(currentIndex)
          console.log(chalk.red(remaining_digits_text) + '\n\n' + scoreMessage)
          // process.stdin.once('data', (resolve, reject) => { resolve() }).then(resolve => {
          //
          // })
          // this.prepareProcessStdinForInput()
          // process.stdin.once('data', () => {
          // // this.promptPressingKey().then(promise => {
          this.breakLoop(resolve)
          // })
          // })
        }
      })
    })
  }
  // promptPressingKey () {
  //   return new Promise((resolve, reject) => {
  //     console.log('Press any key to return to the mode selection.')
  //     process.stdin.once('data', () => {})
  //   })
  // }
  breakLoop (resolve) {
      process.stdin.removeAllListeners('keypress')
      process.stdin.pause()
      resolve()
    // resolve()
  }

  async getStartingPointPrompt () {
    const { NumberPrompt } = require('enquirer')
    return new NumberPrompt({
      name: 'number',
      message: 'Set the starting point(1-100): '
    })
  }

  putCongratulations () {
    const message = this.buildCongratulationsMessage()
    console.log(chalk.bold.green(message))
  }

  buildCongratulationsMessage () {
    const headSpaces = ' '.repeat(6)
    const sentences = [
      'Congratulations!',
      `You have memorized the first ${digitsNum} digits of pi.`
    ]
    return sentences.map(sentence => {
      return headSpaces + sentence + '\n'
    }).join('')
  }

  make_remaining_digits_text (currentIndex) {
    let remaining_digits_text = ''
    const sectionDigitsNum = 10
    const lineDigitsNum = 50
    for (let i = currentIndex; i < digitsNum; i++) {
      if (i  === lineDigitsNum) {
        remaining_digits_text += '\n' + ' '.repeat(piStartText.length)
      } else if (i % sectionDigitsNum === 0) {
        remaining_digits_text += ' '
      }
      remaining_digits_text += piBelowTheDecimalPoint[i]
    }
    return remaining_digits_text
  }
}

class ShowPiMode {
  // TODO: 多分要らない
  constructor(pi_text = piText) {
    this.pi_text = pi_text
  }

  start () {
    return new Promise((resolve, reject) => {
      this.putPiText()
      this.prepareProcessStdinForInput()
      console.log('Press any key to return to the mode selection.')
      process.stdin.once('data', () => { resolve() })
    })
  }
  // start () {
  //   return new Promise((resolve, reject) => {
  //     this.putPiText()
  //     resolve()
  //     this.prepareProcessStdinForInput()
  //     console.log('Press any key to return to the mode selection.')
  //     process.stdin.once('data', () => { resolve() })
  //   })
  // }

  prepareProcessStdinForInput () {
    require('readline').emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.resume()
  }

  putPiText () {
    const pi_text = this.buildSeparatedPiText()
    console.log(pi_text + "\n")
  }

  buildSeparatedPiText () {
    // TODO: もっと良い方法
    const sectionHeadIndex = 2
    const sectionDigits = 10
    let pi_text = this.pi_text.slice(0, 2)
    for (let i = 0; i < 10; i++) {
      if (i !== 0 && i % 5 === 0) {
        pi_text += "\n  "
      } else if (i !== 0) {
        pi_text += ' '
      }
      pi_text += this.pi_text.substr(sectionHeadIndex + sectionDigits * i, 10)
    }
    return pi_text
  }
}

class Game {
  constructor () {
    const sqlite3 = require('sqlite3').verbose()
    this.db = new sqlite3.Database('./high_scores.db')
    this.db.run('create table if not exists notes(id integer primary key, score integer)')
    this.practiceModeText = 'PRACTICE MODE'
    this.realModeText = 'REAL MODE'
    this.showPiDigitsModeText = 'SHOW PI DIGITS'
    this.quittingText = 'QUIT'
  }

  async buildPrompt () {
    const modes = [
      {
        name: this.practiceModeText,
        explanation: 'Check how many digits of pi you can name from the point you designated.'
      },
      {
        name: this.realModeText,
        explanation: 'Check how many digits of pi you can name.'
      },
      {
        name: this.showPiDigitsModeText,
        explanation: 'Check the first 100 digits of pi.'
      },
      {
        name: this.quittingText,
        explanation: 'Quit the game.'
      }
    ]
    return new Select({
      name: 'mode',
      message: 'Select your mode:',
      choices: modes.map(mode => mode.name),
      footer () {
        const explanations = modes.map(mode => ' '.repeat(2) + mode.explanation)
        return chalk.green('\n' + explanations[this.index])
      }
    })
  }

  async start () {
    this.putWelcomeMessage()
    const prompt = await this.buildPrompt()
    prompt.run().then(answer => {
      console.clear()
      this.playMode(answer).then(promise => new Game().start())
    })
  }

  buildWelcomeMessage () {
    const repeatingTimes = 10
    return '>'.repeat(repeatingTimes) + ' PI GAME ' + '<'.repeat(repeatingTimes)
  }

  putWelcomeMessage () {
    console.clear()
    const welcomeMessage = this.buildWelcomeMessage()
    console.log(chalk.bold.green(welcomeMessage) + '\n')
  }


  playMode (answer) {
    switch (answer) {
      case this.practiceModeText:
        return new PracticeMode(this.pi_text).start()
      case this.realModeText:
        break;
      case this.showPiDigitsModeText:
        return new ShowPiMode(this.pi_text).start()
      case this.quittingText:
        console.log(chalk.bold.green('\nThank you for playing'))
        process.exit()
    }
  }
}

new Game().start()
