package utils;

import models.Action;
import models.CapturedGesture;
import models.GestureInstant;
import models.Touch;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import play.data.binding.TypeBinder;

import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

/**
 * User: Noel Zeng.
 * Part of PACKAGE_NAME.
 */
//@Global
public class GestureListBinder implements TypeBinder<List<CapturedGesture>> {

    @Override
    public Object bind(String name, Annotation[] annotations, String value, Class actualClass, Type genericType) throws Exception {
        // Will use Jackson's Tree model.
        return deserialise(value);
    }
    
    public List<CapturedGesture> deserialise(String value) throws Exception{
        ObjectMapper mapper = new ObjectMapper();
        JsonParser p = new JsonFactory().createJsonParser(value);
        JsonNode root = mapper.readTree(p);
        return deserialiseGestures(root);
    }
    
    public List<CapturedGesture> deserialiseGestures(JsonNode root){
        //System.out.println("Gestures called!");
        List<CapturedGesture> gestures = new ArrayList<CapturedGesture>();
        for (JsonNode g:root){
            gestures.add(deserialiseGesture(g));
        }
        return gestures;
    }

    public CapturedGesture deserialiseGesture(JsonNode n){
        //System.out.println("Gesture called!");
        String actionName = n.get("gid").asText();
        Action a = Action.getOrCreate(actionName);
        CapturedGesture g = new CapturedGesture(a);
        List<GestureInstant> instants = deserialiseInstants(n.get("captured"),g);
        g.touchesOverTime = instants;
         return g;
    }
    
    public List<GestureInstant> deserialiseInstants(JsonNode n,CapturedGesture g){
        List<GestureInstant> instants = new ArrayList<GestureInstant>();
        for (JsonNode instant:n){
            instants.add(deserialiseInstant(instant,g));
        }
        return instants;
    }
    
    public GestureInstant deserialiseInstant(JsonNode n,CapturedGesture g){
        long time = n.get("time").asLong();
        GestureInstant instant = new GestureInstant(time,g);
        instant.touches = deserialiseTouches(n.get("touches"),instant);
        return instant;
    }
    
    public List<Touch> deserialiseTouches(JsonNode node,GestureInstant i){
        List<Touch> r = new ArrayList<Touch>();
        for (JsonNode touch:node){
            r.add(deserialiseTouch(touch,i));
        }
        return r;
    }
    
    public Touch deserialiseTouch(JsonNode node,GestureInstant i){
        String id = node.get("fid").asText();
        int x = node.get("coords").get("x").asInt();
        int y = node.get("coords").get("y").asInt();
        return new Touch(x,y,id,i);
    }
}
