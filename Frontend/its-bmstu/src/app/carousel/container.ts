import {Properties as CarouselProperties} from './interfaces';

export class Container {
    /* The index of the new position relative to
     * the active index, for example -1 or +1
     */
    newPositionIndex: number = 0;
    isPositionCorrection: boolean = false;
    initialPositionX: number = 0;
    initialElementPositionX: number = 0;
    pullLimit: number = 100;
    startTime: number = 0;
    startX: number = 0;
    moveX: number = 0;
    isSwipeInProgress: boolean = false;

    get visibleWidth() {
        return this.utils.visibleWidth;
    }

    get overflowCellsLimit() {
        return this.utils.overflowCellsLimit;
    }

    get images() {
        return this.carouselProperties.images;
    }

    get element() {
        return this.carouselProperties.cellsElement;
    }

    get freeScroll() {
        return this.carouselProperties.freeScroll;
    }

    get fullCellWidth() {
        return this.carouselProperties.cellWidth + this.carouselProperties.margin;
    }

    get numberOfVisibleCells() {
        return this.utils.numberOfVisibleCells;
    }

    get transitionDuration() {
        return this.carouselProperties.transitionDuration;
    }

    get transitionTimingFunction() {
        return this.carouselProperties.transitionTimingFunction;
    }

    get cellLength() {
        if (this.images) {
            return this.images.length;
        } else {
            return this.cells.cellLength;
        }
    }

    get cellLengthInLightDOMMode() {
        if (this.images) {
            let cellLength = this.numberOfVisibleCells + this.overflowCellsLimit * 2;
            if (cellLength > this.images.length) {
                cellLength = this.images.length;
            }
            return cellLength;
        } else {
            return this.cellLength;
        }
    }

    get tooFewCells() {
        return this.numberOfVisibleCells > this.cellLength;
    }

    get disabled() {
        return this.tooFewCells;
    }

    get margin() {
        return this.carouselProperties.margin;
    }

    constructor(private carouselProperties: CarouselProperties,
        private utils:any,
        private cells:any) {

        this.init()
    }

    updateProperties(carouselProperties: CarouselProperties) {
        this.carouselProperties = carouselProperties;
    }

    init() {
        this.setWidth();
    }

    handleTouchstart() {
        this.startX = this.utils.getStartX(event);
        this.startTime = new Date().getTime();
        this.initialElementPositionX = this.getInitialElementPositionX();
    }

    handleHorizontalSwipe() {
        if (this.disabled) {
            return;
        }

        if (!this.isSwipeInProgress) {
            this.startX = this.utils.getStartX(event);
            this.startTime = new Date().getTime();
            this.initialElementPositionX = this.getInitialElementPositionX();
        }

        this.isSwipeInProgress = true;
        this.moveX = this.utils.getMoveX(event);
        this.move();
    }

    handleTouchend(simpleProcessing: boolean = false) {
        if (this.disabled) {
            return;
        }

        /* If touchend was passed to the Slide class */
        if (simpleProcessing) {
            this.isSwipeInProgress = false;
            return;
        }

        this.isSwipeInProgress = false;
        this.finishMoving();
        this.clearInitialValues();
    }

    move() {
        let positionX: number = this.getMovePositionX();
        const isPulled = this.detectPulled();
        const direction = this.getDirection();

        if (isPulled) {
            if (isPulled.edge === "left" && direction === "right" ||
                isPulled.edge === "right" && direction === "left") {
                positionX = this.slowdownOnPull(positionX);
            }
        }
        //
        this.transformPositionX(positionX, 0);

        if (this.freeScroll) {
            this.initialPositionX = positionX;
        }

        if (isPulled) {
            if (isPulled.edge === 'left' && isPulled.overflowX > this.pullLimit) {
                this.initialPositionX = 0;
            }
            if (isPulled.edge === 'right' && isPulled.overflowX > this.pullLimit) {
                this.initialPositionX = positionX;
            }
        }
    }

    getMovePositionX() {
        const distance = this.getDistance();
        console.log("getMovePositionX", distance)
        return this.initialElementPositionX - distance;
    }

    getDistance() {
        return this.startX - this.moveX;
    }

    /* If the container is pulled out of the left or right border */
    detectPulled() {


        const currentPositionX = this.getCurrentPositionX();

        if (currentPositionX > 0) {
            console.log("detect pulled - left")
            return {
                edge: 'left',
                positionX: currentPositionX,
                overflowX: Math.abs(currentPositionX)
            }
        }

        if (currentPositionX < this.getEndPosition()) {
            console.log("detect pulled - right")
            return {
                edge: 'right',
                positionX: currentPositionX,
                overflowX: Math.abs(currentPositionX - this.getEndPosition())
            }
        }

        console.log("detect pulled - undefined")

        return undefined;
    }

    slowdownOnPull(_positionX: number) {
        let distance = Math.abs(this.getDistance());
        const endPosition = this.getEndPosition();
        const isPulled = this.detectPulled();

        if (!isPulled) {
            return 0;
        }

        const decelerationRatio = 3 + isPulled.overflowX / 50;
        let positionX:number = 0;

        if (isPulled.edge === 'left') {

            if (this.initialElementPositionX < 0) {
                distance = distance - Math.abs(this.initialElementPositionX);
            }

            const rubberPositionX = distance / decelerationRatio;
            positionX = rubberPositionX;

            if (this.initialElementPositionX > 0) {
                positionX = this.initialElementPositionX + rubberPositionX;
            }

            if (positionX > this.pullLimit) {
                positionX = this.pullLimit;
            }
        }

        if (isPulled.edge === 'right') {
            const rubberPositionX = endPosition + (((this.initialElementPositionX - distance) - endPosition) / decelerationRatio);
            const containerWidth = this.getWidth();

            positionX = rubberPositionX;

            if (this.initialElementPositionX < -(containerWidth - this.visibleWidth)) {
                positionX = ((containerWidth - this.visibleWidth) + this.initialElementPositionX) + rubberPositionX;
            }

            if (positionX < endPosition - this.pullLimit) {
                positionX = endPosition - this.pullLimit;
            }
        }

        return positionX;
    }

    finishMoving() {
        const positionX = this.getMovePositionX();
        let newPositionX:number = 0;

        if (this.freeScroll) {
            newPositionX = this.getInertia();
        }

        /* Align container while pulling */
        newPositionX = this.getAlignedPositionOnPull(newPositionX);

        this.transformPositionX(newPositionX);



        this.setInitialPosition(positionX);
        for(let i = 0; i < this.cells.length; i++){
          let cel = this.cells[i];

        }
        // this.cells.
    }

    /* Returns the new position of the container with inertia */
    getInertia() {
        const distance = this.getDistance();
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.startTime;
        let inertia = (distance / tapLength) * 100;

        return this.initialPositionX - inertia;
    }

    getAlignedPositionOnPull(newPositionX:number) {
        const direction = this.getDirection();

        if (direction === 'left') {
            let endPosition = this.getEndPosition();
            if (newPositionX < endPosition) {
                return endPosition;
            }
        }
        if (direction === 'right') {
            if (newPositionX > 0) {
                return 0;
            }
        }

        return newPositionX;
    }

    getCurrentPositionX() {
        const parentPosition = this.element!.parentElement!.getBoundingClientRect();
        const position = this.element.getBoundingClientRect();
        return position.left - parentPosition.left;
    }

    getEndPosition() {
          let imagesInContainer = this.cells.imageUtils.getImages();
          return -(imagesInContainer.length * this.fullCellWidth - this.visibleWidth - this.margin);
    }
    //todo

    transformPositionX(value:number, duration = this.transitionDuration) {
        if (value === undefined) {
            return;
        }

        console.log(this.element)
        this.element.style.transition = 'transform ' + duration + 'ms ' + this.transitionTimingFunction;
        this.element.style.transform = 'translateX(' + value + 'px)';
        // this.element.parentElement.childNodes.findIndex();
        // var index = Array.prototype.indexOf.call(parent.children, child);
        // if (==2){
        //   this.element.style.scale = '0.1';
        // }
        // else {
        //   this.element.style.scale = '1'
        // }
        // if (value=== 3) {
        //   this.element.style.transform = 'scale(0.7), translateX(' + value + 'px)';
        // }
        // else {
        //   this.element.style.transform = 'scale(1.0), translateX(' + value + 'px)';
        // }
    }

    getWidth() {
        let width = this.cellLengthInLightDOMMode * this.fullCellWidth;
        let totalImageWidth = this.cellLength * this.fullCellWidth;

        if (totalImageWidth < width) {
            width = totalImageWidth;
        }

        return width;
    }

    setWidth() {
        const width = this.getWidth();
        this.element.style.width = width + "px";
    }

    setInitialPosition(position:number) {
        this.initialPositionX = position;
    }

    getElementPosition() {
        return this.element.getBoundingClientRect();
    }

    getInitialElementPositionX() {
        const carouselElementPosition = this.utils.getCarouselElementPosition()['left'];
        return this.getElementPosition()['left'] - carouselElementPosition;
    }

    clearInitialValues() {
        this.startX = this.moveX = 0;
    }

    getDirection() {
        const direction = Math.sign(this.startX - this.moveX);

        if (direction === -1) {
            return 'right';
        }
        if (direction === 1) {
            return 'left';
        }

        return undefined;
    }
}
