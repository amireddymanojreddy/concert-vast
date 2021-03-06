const VIDEO_PAGE = 'http://localhost:8080/test/video-js-preroll.html';
const TOP_LEVEL_VIDEO_JS_SELECTOR = '.video-js';
const IMPRESSION_SELECTOR = 'img.vast-pixel';

context('VideoJs as Preroll Application', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('vast.xml').as('vastXML');
    cy.route('GET', 'https://ad.doubleclick.net/ddm/*', '@vastXML');
  });

  it('should have a video element on the page', () => {
    cy.visit(VIDEO_PAGE);
    cy.get(TOP_LEVEL_VIDEO_JS_SELECTOR).should('have.class', 'vast-running');
  });

  it('should load an impression tracker on the page when playing', () => {
    cy.visit(VIDEO_PAGE);
    cy.get(IMPRESSION_SELECTOR).should('have.length', 0);
    cy.get('.vast-running');
    cy.get('.vast-playing');
    cy.get(IMPRESSION_SELECTOR).should('have.length', 2);
  });

  it('should run through all the quartiles when playing', () => {
    cy.visit(VIDEO_PAGE);
    cy.get(IMPRESSION_SELECTOR).should('have.length', 0);
    cy.get('.vast-running');
    cy.get('.vast-playing');
    cy.fastForwardVideo({ fromEnd: 0.5 });
    cy.wait(500);
    cy.get(IMPRESSION_SELECTOR).should('have.length', 8);
  });

  it('should open a new window when clicked', () => {
    cy.visit(VIDEO_PAGE, {
      onBeforeLoad(win) {
        cy.stub(win, 'open')
          .as('windowOpen')
          .returns({ focus: () => {} });
      },
    });
    cy.wait(500);
    cy.get('.vast-running').click();
    cy.get('@windowOpen').should('be.called');
  });

  it('should remove classes after video plays', () => {
    cy.visit(VIDEO_PAGE);
    cy.get('.vast-running');
    cy.get('.vast-playing');
    cy.wait(1000);
    cy.fastForwardVideo({ fromEnd: 0.5 });
    cy.get(TOP_LEVEL_VIDEO_JS_SELECTOR).should('not.have.class', 'vast-playing');
  });

  it('should remove vast video after vast video plays', () => {
    cy.visit(VIDEO_PAGE);
    cy.get('.vast-running');
    cy.get('.vast-playing');

    cy.fastForwardVideo({ fromEnd: 0.5 });
    cy.wait(1000);
    cy.get('video').should('not.have.ownProperty', 'src');
    cy.get('video').find('source[src="http://clips.vorwaerts-gmbh.de/VfE_html5.mp4"]');
  });

  it('should not open the clickthrough on click after vast video completes', () => {
    cy.visit(VIDEO_PAGE, {
      onBeforeLoad(win) {
        cy.stub(win, 'open')
          .as('windowOpen')
          .returns({ focus: () => {} });
      },
    });
    cy.get('.vast-playing');
    cy.fastForwardVideo({ fromEnd: 0.5 });
    cy.wait(3000);
    cy.get(TOP_LEVEL_VIDEO_JS_SELECTOR).click();
    cy.get('@windowOpen').should('not.be.called');
  });
});
