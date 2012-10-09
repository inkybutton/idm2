package controllers;

import models.CaptureSession;
import models.CapturedGesture;
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
            CaptureSession thisSession = new CaptureSession(gs,screen);
            thisSession.save();
        } catch (Exception e) {
            e.printStackTrace();
        }
        render();
    }

    public static void overview(){
        renderArgs.put("numNew",CaptureSession.getNotDownloaded().size());
        renderArgs.put("numOld",CaptureSession.getDownloaded().size());
        render();
    }

    public static void getNewCSV(){
        List<CaptureSession> sessions = CaptureSession.getNotDownloaded();
        response.contentType = "text/csv";
        for (CaptureSession s:sessions){
            try {
                response.writeChunk(s.downloadCSV().call());
            } catch (Exception e){
                e.printStackTrace();
            }
        }       
    }
    
    public static void getOldCSV(){
        List<CaptureSession> sessions = CaptureSession.getDownloaded();
        response.contentType = "text/csv";
        for (CaptureSession s:sessions){
            try {
                response.writeChunk(s.downloadCSV().call());
            } catch (Exception e){
                e.printStackTrace();
            }
        }
    }
    
    public static void getAllCSV(){
        List<CaptureSession> sessions = CaptureSession.all().fetch();
        response.contentType = "text/csv";
        for (CaptureSession s:sessions){
            try {
                response.writeChunk(s.downloadCSV().call());
            } catch (Exception e){
                e.printStackTrace();
            }
        } 
    }

}