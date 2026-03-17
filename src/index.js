import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}


class Dog extends Card {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power); 
    }
}

class Duck extends Card {
     constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
     }

     quacks() {
        console.log('quack');
    }

    swims () {
        console.log('float: both;')
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
    new Duck('Мирный житель', 2),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog('Бандит', 3),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
