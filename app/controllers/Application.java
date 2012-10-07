package controllers;

import models.CapturedGesture;
import models.RecordRange;
import models.ScreenResolution;
import play.mvc.Controller;
import utils.GestureListBinder;

import java.util.List;

public class Application extends Controller {

    public static void index() {
        render();
    }

    public static void submitData(ScreenResolution screen,String captured){
        GestureListBinder b = new GestureListBinder();
        try {
            List<CapturedGesture> gs = b.deserialise(captured);
            for (CapturedGesture g:gs){
                g.save();
            }
            renderArgs.put("data",gs.size());
        } catch (Exception e) {
            e.printStackTrace();
        }
        renderArgs.put("resWidth",screen.x);
        renderArgs.put("resHeight",screen.y);
        render();
    }

    public static void viewRange(RecordRange r){

    }

}