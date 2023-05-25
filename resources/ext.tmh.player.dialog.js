/**
 * A media OOUI dialog to open and play a media element in.
 *
 * A modal interaction, only one dialog should be opened at a time
 *
 * @class MediaDialog
 * @extends OO.ui.ProcessDialog
 */
class MediaDialog extends OO.ui.ProcessDialog {
	/**
	 * @param {Object} config
	 * @cfg {jQuery} $video element to present
	 */
	constructor( config ) {
		super( config );
		this.$video = config.$video;
	}

	initialize() {
		super.initialize();

		this.$element.addClass( 'mw-tmh-media-dialog' );
		this.$element.on( 'click', ( e ) => {
			if (
				!this.$body.get( 0 ).contains( e.target ) &&
				!this.$head.get( 0 ).contains( e.target )
			) {
				// Close the dialog when user clicks outside of it
				this.close();
			}
		} );

		this.content = new OO.ui.PanelLayout( {
			padded: false,
			expanded: true
		} );

		this.content.$element.append( this.$video );
		this.$body.append( this.content.$element );
	}

	getBodyHeight() {
		// Fixed 16:10 ratio for the dialog. This may change.
		return Math.round( this.content.$element.width() * 10 / 16 );
	}

	getActionProcess( action ) {
		if ( action ) {
			return new OO.ui.Process( () => {
				this.close( { action: action } );
			} );
		}
		return super.getActionProcess( action );
	}

	/**
	 * Initiate playback of the video element.
	 * Loads the JS playback interface and triggers play
	 *
	 * Note: because of autoplay restrictions, this needs to triggered
	 * after a click, for audio to work.
	 */
	play() {
		const indicator = new OO.ui.ProgressBarWidget( {
			progress: false
		} );
		this.content.$element.append( indicator.$element );

		// We don't need a play button (autoplay) nor a poster
		const options = { poster: false, bigPlayButton: false, fill: true };

		const InlinePlayer = mw.loader.require( 'ext.tmh.player.inline' );
		this.inlinePlayer = new InlinePlayer( this.$video.get( 0 ), options );
		// We might cause a delayed load of videojs here.
		this.loadedPromise = this.inlinePlayer.infuse();

		// Start playback when ready...
		this.loadedPromise.then( ( videojsPlayer ) => {
			videojsPlayer.ready( () => {
				// Use a setTimeout to ensure all ready callbacks have run before
				// we start playback. This is important for the source selector
				// plugin, which may change sources before playback begins.
				//
				// This is used instead of an event like `canplay` or `loadeddata`
				// because some versions of EdgeHTML don't fire these events.
				// Support: Edge 18
				setTimeout( function () {
					$( indicator.$element ).detach();
					videojsPlayer.play();
					// Focus the player so that keyboard events work
					videojsPlayer.el().focus();
				}, 0 );
			} );
		} );
	}

	/**
	 * Call this method to stop playback and to cleanup
	 * the player after closing the dialog
	 */
	stop() {
		this.loadedPromise.then( ( videojsPlayer ) => {
			videojsPlayer.pause();
			$.disposeDetachedPlayers();
		} );
	}
}

MediaDialog.static.name = 'tmhMediaDialog';
MediaDialog.static.actions = [
	{ icon: 'close', title: mw.msg( 'timedmedia-dialog-close' ), flags: 'safe' }
];

module.exports = MediaDialog;
