from playwright.sync_api import sync_playwright
url="https://anirudhatalmale6-alt.github.io/foto-evento-demo/"
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={"width":1280,"height":800})
    errs=[]
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.goto(url); pg.wait_for_timeout(1500)
    pg.fill("#pin","2025"); pg.click("#enter"); pg.wait_for_timeout(500)
    ncells=len(pg.query_selector_all(".cell"))
    picks=pg.query_selector_all(".cell .pick")
    for i in [0,1,2,3,4,5,6,7,8,9]: picks[i].click()
    pg.wait_for_timeout(300)
    pg.click("#openCart"); pg.wait_for_timeout(400)
    total=pg.inner_text("#total"); disc=pg.inner_text("#discVal")
    pg.screenshot(path="live_cart.png")
    print("cells:",ncells,"| 10 selected total:",total,"discount:",disc)
    print("console errors:",errs[:5])
    b.close()
