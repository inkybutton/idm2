package controllers;

import models.ScreenResolution;
import play.mvc.Controller;

public class Application extends Controller {

    public static void index() {
        render();
    }

    public static void submitData(ScreenResolution screen,String captured){
        //renderArgs.put("resWidth",screenWidth);
        //renderArgs.put("resHeight",screenHeight);
        renderArgs.put("resWidth",screen.x);
        renderArgs.put("resHeight",screen.y);
        renderArgs.put("data",captured);
        //renderArgs.put("s",request.g);
        render();
    }

}