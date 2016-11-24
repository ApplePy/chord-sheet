import { ChordSheetPage } from './app.po';

describe('chord-sheet App', function() {
  let page: ChordSheetPage;

  beforeEach(() => {
    page = new ChordSheetPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
