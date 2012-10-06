import com.google.gson.*;
import models.CapturedGesture;
import models.Touch;

import java.lang.reflect.Type;
import java.util.HashMap;

/**
 * User: Noel Zeng.
 * Part of PACKAGE_NAME.
 */
class TouchesOverTimeDeserialiser implements JsonDeserializer<HashMap<Long,Touch[]>> {

    private CapturedGesture gesture;
    
    public TouchesOverTimeDeserialiser(CapturedGesture cg){
        gesture = cg;
    }
    
    @Override
    public HashMap<Long, Touch[]> deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException {
         HashMap<Long,Touch[]> result = new HashMap<Long, Touch[]>();
       JsonArray arr = jsonElement.getAsJsonArray();
       for (JsonElement e:arr){
           JsonObject o = e.getAsJsonObject();
           deserialiseTouches(o.get("touches").getAsJsonObject());
              //result.put(o.get("time").getAsLong())
       }
        return result;  //To change body of implemented methods use File | Settings | File Templates.
    }

    private Touch[] deserialiseTouches(JsonObject o){
            //for (String k:o.keys()){

            //}
        return null;
    }

}