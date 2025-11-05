class ReservationCompletePage {
  constructor(page) {
    this.page = page;
    this.DEFAULT_TIMEOUT = 10000;
    this.reservationNumberLocator = page.locator('.p-reservation-number__number');
  }


async getReservationNumber() {
    await this.reservationNumberLocator.waitFor({ state: 'visible', timeout: this.DEFAULT_TIMEOUT });
    return await this.reservationNumberLocator.innerText();
  } 

}




  

module.exports = { ReservationCompletePage };