//遊戲狀態
const GAME_START = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished',

}



//圖檔來源
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃  
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心 
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊  
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花           
]
// 0 - 12：黑桃 1 - 13
// 13 - 25：愛心 1 - 13
// 26 - 38：方塊 1 - 13
// 39 - 51：梅花 1 - 13

// Model-'View'-Controller  資料顯示
const view = {

  //第一次進入牌局
  getCardElement(index) {

    return `
    <div class="card back" data-index="${index}" >
    </div>
    `
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
      <p >${number}</p>         
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `
  },

  //轉換 A,J,Q,K
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexs) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexs.map(index => this.getCardElement(index)).join('')

  },

  //...會可以讓很多資料帶入變成一個array 如 cards = [1,2,3,4,5]
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        //回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      card.classList.add('back')
      card.innerHTML = null
      //回傳背面
    })

  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })

  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTryTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', function OnanimationendCard(event) {
        card.classList.remove('wrong')
      },
        {
          once: true
        }  //一次性 觸發完就消失(節省瀏覽器效能)
      )
    })
  },

  //260分結束遊戲
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


// 'Model'-View-Controller  資料集中管理
const model = {
  revealedCards: [],//被翻開的卡

  isRevealCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 260,

  triedTimes: 0,
}


// Model-View-'Controller'  資料控制/動作
const controller = {
  currentState: GAME_START.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
    //亂數52張牌
  },

  //依照不同遊戲狀態，做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_START.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_START.SecondCardAwaits
        break

      case GAME_START.SecondCardAwaits:
        view.renderTryTimes(model.triedTimes++)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealCardsMatched()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_START.CardsMatched
          view.pairCards(...model.revealedCards)
          // view.pairCards(model.revealedCards[0])
          // view.pairCards(model.revealedCards[1])
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_START.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_START.FirstCardAwaits
        }
        else {
          //配對失敗
          this.currentState = GAME_START.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
          //這裡要放function本身 而不是()他的結果
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    //...把model.revealedCards陣列東西都丟入
    // view.flipCards(model.revealedCards[0])
    // view.flipCards(model.revealedCards[1])
    model.revealedCards = []
    controller.currentState = GAME_START.FirstCardAwaits
  },
}


//外掛函式庫
const utility = {
  //52張牌亂數
  getRandomNumberArray(count) {

    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        //index + 1 因為有52張牌
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()


//Node List (array-like) 為每一個.card上面都增加監聽器
document.querySelectorAll('.card').forEach(card => {

  card.addEventListener('click', function onClickedCard(event) {
    controller.dispatchCardAction(card)

  })
})