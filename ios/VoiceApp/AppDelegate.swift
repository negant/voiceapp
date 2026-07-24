import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

/// Keep in sync with package.json (`--port 8088`) and ios/.xcode.env (`RCT_METRO_PORT`).
private let metroPackagerHostPort = "localhost:8088"

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
#if DEBUG
    // Prebuilt React.framework defaults packager checks to :8081. Point shared
    // settings at :8088 so status/HMR/reload hit the same Metro as the JS bundle.
    RCTBundleURLProvider.sharedSettings().jsLocation = metroPackagerHostPort
#endif

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "VoiceApp",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.jsBundleURL(
      forBundleRoot: "index",
      packagerHost: metroPackagerHostPort,
      enableDev: true,
      enableMinification: false,
      inlineSourceMap: false
    )
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
