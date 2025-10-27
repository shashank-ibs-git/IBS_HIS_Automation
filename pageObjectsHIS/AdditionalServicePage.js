class AdditionalServicePage {
  constructor(page) {
    this.page = page;
    this.addOnServiceTitle = page.getByRole('heading', { name: '追加サービスの選択' });
  }

}

module.exports = { AdditionalServicePage };